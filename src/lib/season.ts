import type { EventRecord } from '@/types'
import { isPast, nextSeasonDate } from '@/lib/dates'

export interface SeasonSlot {
  key: string
  name: string
  courseId: string
  courseName: string
  lastPlayed: string
  lastHeadcount: number | null
  lastRate: number | null
  firstTeeTime: string | null
  groupsHeld: number | null
  suggestedDate: string
  booked: EventRecord | null
}

function sameName(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/**
 * Last year's completed rounds, one row per tournament name, with a date to
 * hold next. A matching upcoming event counts as already on the book.
 */
export function seasonSlots(events: EventRecord[]): SeasonSlot[] {
  const latest = new Map<string, EventRecord>()

  for (const event of events) {
    if (event.status !== 'complete' && !isPast(event.eventDate)) continue
    const key = event.name.trim().toLowerCase()
    const existing = latest.get(key)
    if (!existing || event.eventDate > existing.eventDate) {
      latest.set(key, event)
    }
  }

  const upcoming = events.filter((event) => !isPast(event.eventDate))

  return [...latest.values()]
    .map((event) => ({
      key: event.name.trim().toLowerCase(),
      name: event.name,
      courseId: event.courseId,
      courseName: event.courseName,
      lastPlayed: event.eventDate,
      lastHeadcount: event.headcount,
      lastRate: event.ratePaid ?? event.rateQuoted,
      firstTeeTime: event.firstTeeTime,
      groupsHeld: event.groupsHeld,
      suggestedDate: nextSeasonDate(event.eventDate),
      booked:
        upcoming.find((open) => sameName(open.name, event.name)) ?? null,
    }))
    .sort((a, b) => {
      const byMonth = a.suggestedDate.slice(5).localeCompare(b.suggestedDate.slice(5))
      if (byMonth !== 0) return byMonth
      return a.suggestedDate.localeCompare(b.suggestedDate)
    })
}
