import { Hono } from 'hono'
import type { EventRecord, NewEventInput } from '@shared/types'
import { requireDirector, type Actor } from '@server/middleware/clerk'
import { recordChange } from '@server/lib/audit'
import { loadDashboard } from '@server/lib/dashboard'
import { supabase } from '@server/lib/supabase'

export const eventRoutes = new Hono<{ Variables: { actor: Actor } }>()

/**
 * Logging an event is what drives rate tracking — a Postgres trigger rolls the
 * newest rate_paid onto the course. Nobody edits rate history directly.
 */
eventRoutes.post('/events', requireDirector, async (c) => {
  const actor = c.get('actor')
  const input = await c.req.json<NewEventInput>()

  const { data, error } = await supabase()
    .from('events')
    .insert({
      course_id: input.courseId,
      state_code: 'ID',
      name: input.name,
      event_date: input.eventDate,
      headcount: input.headcount,
      rate_paid: input.ratePaid,
      is_tournament: input.isTournament,
      source: 'manual',
      updated_by: actor.email,
    })
    .select('id')
    .single()

  if (error) return c.json({ message: error.message }, 500)

  await recordChange({
    tableName: 'events',
    rowId: data.id,
    field: 'created',
    oldValue: null,
    newValue: `${input.name} @ ${input.eventDate}`,
    actorEmail: actor.email,
  })

  return c.json(await loadDashboard())
})

eventRoutes.patch('/events/:id', requireDirector, async (c) => {
  const id = c.req.param('id')
  const actor = c.get('actor')
  const patch = await c.req.json<Partial<EventRecord>>()

  // Only these are settable from the client; the rest are derived or immutable.
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: actor.email,
  }
  if ('headcountSentAt' in patch) row.headcount_sent_at = patch.headcountSentAt
  if ('teeSheetSentAt' in patch) row.tee_sheet_sent_at = patch.teeSheetSentAt
  if ('headcount' in patch) row.headcount = patch.headcount
  if ('ratePaid' in patch) row.rate_paid = patch.ratePaid
  if ('name' in patch) row.name = patch.name
  if ('eventDate' in patch) row.event_date = patch.eventDate

  const { error } = await supabase().from('events').update(row).eq('id', id)
  if (error) return c.json({ message: error.message }, 500)

  return c.json(await loadDashboard())
})

/** Soft delete, so "Undo" in the UI is always possible. */
eventRoutes.delete('/events/:id', requireDirector, async (c) => {
  const id = c.req.param('id')
  const actor = c.get('actor')

  const { error } = await supabase()
    .from('events')
    .update({ deleted_at: new Date().toISOString(), updated_by: actor.email })
    .eq('id', id)

  if (error) return c.json({ message: error.message }, 500)

  await recordChange({
    tableName: 'events',
    rowId: id,
    field: 'deleted_at',
    oldValue: null,
    newValue: 'deleted',
    actorEmail: actor.email,
  })

  return c.json(await loadDashboard())
})

eventRoutes.post('/events/:id/restore', requireDirector, async (c) => {
  const id = c.req.param('id')
  const actor = c.get('actor')

  const { error } = await supabase()
    .from('events')
    .update({ deleted_at: null, updated_by: actor.email })
    .eq('id', id)

  if (error) return c.json({ message: error.message }, 500)
  return c.json(await loadDashboard())
})
