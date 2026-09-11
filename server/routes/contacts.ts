import { Hono } from 'hono'
import type { ContactInput } from '@shared/types'
import { requireDirector, type Actor } from '@server/middleware/clerk'
import { recordChange } from '@server/lib/audit'
import { loadDashboard } from '@server/lib/dashboard'
import { supabase } from '@server/lib/supabase'

export const contactRoutes = new Hono<{ Variables: { actor: Actor } }>()

/**
 * Course contacts are director-owned: a CSV or Teegle sync never writes here,
 * so re-importing the course list can't wipe work someone did by hand.
 */
contactRoutes.put('/courses/:id/contact', requireDirector, async (c) => {
  const courseId = c.req.param('id')
  const actor = c.get('actor')
  const input = await c.req.json<ContactInput>()
  const db = supabase()

  const { data: existing } = await db
    .from('course_contacts')
    .select('id, contact_name, last_confirmed_date')
    .eq('course_id', courseId)
    .maybeSingle()

  const row = {
    course_id: courseId,
    contact_name: input.contactName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
    last_confirmed_date: input.confirmNow
      ? new Date().toISOString().slice(0, 10)
      : (existing?.last_confirmed_date ?? null),
    updated_at: new Date().toISOString(),
    updated_by: actor.email,
  }

  const { error } = existing
    ? await db.from('course_contacts').update(row).eq('id', existing.id)
    : await db.from('course_contacts').insert(row)

  if (error) return c.json({ message: error.message }, 500)

  // A contact a director typed is real data, not seeded sample data.
  await db
    .from('courses')
    .update({ source: 'manual' })
    .eq('id', courseId)
    .eq('source', 'sample')

  await recordChange({
    tableName: 'course_contacts',
    rowId: existing?.id ?? courseId,
    field: 'contact',
    oldValue: existing?.contact_name ?? null,
    newValue: input.contactName,
    actorEmail: actor.email,
  })

  return c.json(await loadDashboard())
})
