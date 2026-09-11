import type { EventRecord } from '@/types'
import { isPast, todayInIdaho } from '@/lib/dates'

export function upcomingTournaments(events: EventRecord[]) {
  return events
    .filter((e) => !isPast(e.eventDate))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
}

export function completedThisYear(events: EventRecord[]) {
  const year = todayInIdaho().slice(0, 4)
  return events.filter(
    (e) => e.eventDate.startsWith(year) && e.status === 'complete',
  )
}

export function tournamentTrends(events: EventRecord[]) {
  const year = todayInIdaho().slice(0, 4)
  const inYear = events.filter((e) => e.eventDate.startsWith(year))
  const paid = inYear.filter((e) => e.ratePaid !== null)
  const avgRate =
    paid.length === 0
      ? null
      : Math.round(
          paid.reduce((sum, e) => sum + (e.ratePaid ?? 0), 0) / paid.length,
        )
  const coursesUsed = new Set(inYear.map((e) => e.courseId)).size
  const upcoming = upcomingTournaments(events)

  return {
    year,
    yearCount: inYear.length,
    completedCount: inYear.filter((e) => e.status === 'complete').length,
    avgRate,
    coursesUsed,
    next: upcoming[0] ?? null,
    upcomingCount: upcoming.length,
  }
}
