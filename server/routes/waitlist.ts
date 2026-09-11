import { Hono } from 'hono'
import type { WaitlistEntry, WaitlistStatus } from '@shared/types'
import { requireDirector, type Actor } from '@server/middleware/clerk'
import { supabase } from '@server/lib/supabase'
import { toWaitlistEntry, type WaitlistRow } from '@server/lib/map'

export const waitlistRoutes = new Hono<{ Variables: { actor: Actor } }>()

const SELECT = 'id, event_id, rank, member_name, phone, email, status'

async function listFor(eventId: string): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase()
    .from('waitlist_entries')
    .select(SELECT)
    .eq('event_id', eventId)
    .order('rank')

  if (error) throw new Error(error.message)
  return ((data ?? []) as WaitlistRow[]).map(toWaitlistEntry)
}

waitlistRoutes.get('/events/:id/waitlist', requireDirector, async (c) => {
  try {
    return c.json(await listFor(c.req.param('id')))
  } catch (error) {
    return c.json({ message: (error as Error).message }, 500)
  }
})

waitlistRoutes.post('/events/:id/waitlist', requireDirector, async (c) => {
  const eventId = c.req.param('id')
  const input = await c.req.json<{ memberName: string; phone: string | null }>()

  try {
    const existing = await listFor(eventId)
    const { error } = await supabase()
      .from('waitlist_entries')
      .insert({
        event_id: eventId,
        rank: existing.length + 1,
        member_name: input.memberName,
        phone: input.phone,
        status: 'waiting',
      })

    if (error) return c.json({ message: error.message }, 500)
    return c.json(await listFor(eventId))
  } catch (error) {
    return c.json({ message: (error as Error).message }, 500)
  }
})

waitlistRoutes.patch('/waitlist/:id', requireDirector, async (c) => {
  const id = c.req.param('id')
  const patch = await c.req.json<{
    status?: WaitlistStatus
    direction?: 'up' | 'down'
  }>()
  const db = supabase()

  const { data: entry, error: findError } = await db
    .from('waitlist_entries')
    .select(SELECT)
    .eq('id', id)
    .single()

  if (findError || !entry) {
    return c.json({ message: findError?.message ?? 'Not found' }, 404)
  }

  try {
    if (patch.status) {
      const { error } = await db
        .from('waitlist_entries')
        .update({ status: patch.status })
        .eq('id', id)
      if (error) return c.json({ message: error.message }, 500)
    }

    if (patch.direction) {
      const siblings = await listFor(entry.event_id)
      const index = siblings.findIndex((w) => w.id === id)
      const target = siblings[patch.direction === 'up' ? index - 1 : index + 1]

      if (target) {
        // Swap ranks with the neighbour.
        await db
          .from('waitlist_entries')
          .update({ rank: target.rank })
          .eq('id', id)
        await db
          .from('waitlist_entries')
          .update({ rank: entry.rank })
          .eq('id', target.id)
      }
    }

    return c.json(await listFor(entry.event_id))
  } catch (error) {
    return c.json({ message: (error as Error).message }, 500)
  }
})

waitlistRoutes.delete('/waitlist/:id', requireDirector, async (c) => {
  const id = c.req.param('id')
  const db = supabase()

  const { data: entry } = await db
    .from('waitlist_entries')
    .select('event_id')
    .eq('id', id)
    .maybeSingle()

  const { error } = await db.from('waitlist_entries').delete().eq('id', id)
  if (error) return c.json({ message: error.message }, 500)

  if (!entry) return c.json([])

  try {
    // Close the gap so ranks stay 1..n and the list reads sensibly.
    const remaining = await listFor(entry.event_id)
    await Promise.all(
      remaining.map((row, index) =>
        row.rank === index + 1
          ? Promise.resolve()
          : db
              .from('waitlist_entries')
              .update({ rank: index + 1 })
              .eq('id', row.id),
      ),
    )
    return c.json(await listFor(entry.event_id))
  } catch (error) {
    return c.json({ message: (error as Error).message }, 500)
  }
})
