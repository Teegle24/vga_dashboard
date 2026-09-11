import type { DashboardData } from '@shared/types'
import { supabase } from '@server/lib/supabase'
import { toCourse, toEvent, type CourseRow, type EventRow } from '@server/lib/map'

const COURSE_SELECT = `
  id, name, address, city, state_code, zip, phone, website, source,
  teegle_course_id, list_rate, last_negotiated_rate, last_event_date,
  course_contacts ( contact_name, email, phone, last_confirmed_date, notes, updated_at, updated_by )
`

const EVENT_SELECT = `
  id, course_id, state_code, name, event_date, headcount, rate_paid,
  is_tournament, headcount_sent_at, tee_sheet_sent_at, source, updated_by,
  updated_at, courses ( name )
`

/**
 * Single read used by GET /dashboard and returned from every mutation, so the
 * live API and the mock handler hand back exactly the same shape.
 */
export async function loadDashboard(): Promise<DashboardData> {
  const db = supabase()

  const [courses, events, waitlist] = await Promise.all([
    db.from('courses').select(COURSE_SELECT).is('deleted_at', null).order('name'),
    db
      .from('events')
      .select(EVENT_SELECT)
      .is('deleted_at', null)
      .order('event_date', { ascending: false }),
    db.from('waitlist_entries').select('event_id, status'),
  ])

  const firstError = courses.error ?? events.error ?? waitlist.error
  if (firstError) throw new Error(firstError.message)

  const waitingByEvent = new Map<string, number>()
  for (const row of waitlist.data ?? []) {
    if (row.status !== 'waiting') continue
    waitingByEvent.set(row.event_id, (waitingByEvent.get(row.event_id) ?? 0) + 1)
  }

  const mappedCourses = ((courses.data ?? []) as unknown as CourseRow[]).map(
    toCourse,
  )
  const mappedEvents = ((events.data ?? []) as unknown as EventRow[]).map((row) =>
    toEvent(row, waitingByEvent.get(row.id) ?? 0),
  )

  return {
    courses: mappedCourses,
    events: mappedEvents,
    hasSampleData:
      mappedCourses.some((course) => course.source === 'sample') ||
      mappedEvents.some((event) => event.source === 'sample'),
  }
}
