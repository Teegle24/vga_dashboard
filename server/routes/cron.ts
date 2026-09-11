import { Hono } from 'hono'
import { requireCronSecret } from '@server/middleware/clerk'
import { supabase } from '@server/lib/supabase'

export const cronRoutes = new Hono()

/**
 * Daily headcount check, run by Vercel Cron at 8am Mountain.
 *
 * The window is 6-8 days out rather than exactly 7 so a delayed or skipped run
 * can't step over an event entirely. Events already marked as sent are ignored.
 */
cronRoutes.get('/cron/headcount', requireCronSecret, async (c) => {
  const db = supabase()

  const today = new Date()
  const iso = (offsetDays: number) =>
    new Date(today.getTime() + offsetDays * 86_400_000)
      .toISOString()
      .slice(0, 10)

  const { data, error } = await db
    .from('events')
    .select('id, name, event_date, headcount, courses ( name )')
    .is('deleted_at', null)
    .is('headcount_sent_at', null)
    .gte('event_date', iso(6))
    .lte('event_date', iso(8))

  if (error) return c.json({ message: error.message }, 500)

  const due = (data ?? []).map((row) => {
    // Supabase types an embedded one-to-one join as an array.
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    return {
      id: row.id,
      event: row.name,
      course: (course as { name: string } | null)?.name ?? '',
      date: row.event_date,
      headcount: row.headcount,
    }
  })

  // The in-app banner is the primary nudge; email is added in phase 2 once a
  // Resend key exists. Returning the list keeps the job observable meanwhile.
  return c.json({ checked: iso(0), due })
})
