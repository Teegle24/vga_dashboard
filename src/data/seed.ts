import type {
  Course,
  DashboardData,
  EventRecord,
  Member,
  Player,
  WaitlistEntry,
} from '@/types'
import {
  COURSE_SEEDS,
  EVENT_SEEDS,
  EXTRA_MEMBER_SEEDS,
  PLAYER_SEEDS,
  WAITLIST_SEEDS,
  slugify,
} from '@/data/idaho-seed'
import { todayInIdaho } from '@/lib/dates'
import { FLIGHT_IDS, type Flight } from '@/lib/flights'

/**
 * The directory everyone starts from, built out of the Idaho seed list. Dates
 * are relative to today, which keeps the headcount reminder demonstrable on any
 * day you open the demo.
 */

function day(offset: number): string {
  const [y, m, d] = todayInIdaho().split('-').map(Number)
  const base = Date.UTC(y!, m! - 1, d!, 12)
  return new Date(base + offset * 86_400_000).toISOString().slice(0, 10)
}

function ago(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

const EMPTY_CONTACT = {
  contactName: null,
  email: null,
  phone: null,
  lastConfirmedDate: null,
  notes: null,
  updatedAt: null,
  updatedBy: null,
}

export const seedCourses: Course[] = COURSE_SEEDS.map((seed, index) => ({
  id: slugify(seed.name),
  name: seed.name,
  address: seed.address,
  city: seed.city,
  stateCode: 'ID',
  zip: seed.zip,
  phone: `208-555-0${String(200 + index).slice(-3)}`,
  website: seed.website,
  source: 'sample',
  teegleCourseId: null,
  listRate: seed.listRate,
  lastNegotiatedRate: null,
  lastEventDate: null,
  contact: seed.contact
    ? {
        contactName: seed.contact.name,
        email: seed.contact.email,
        phone: seed.contact.phone,
        lastConfirmedDate: day(-seed.contact.confirmedDaysAgo),
        notes: seed.contact.notes ?? null,
        updatedAt: ago(seed.contact.confirmedDaysAgo),
        updatedBy: seed.contact.by,
      }
    : { ...EMPTY_CONTACT },
}))

function courseName(slug: string) {
  return seedCourses.find((c) => c.id === slug)?.name ?? 'Unknown course'
}

export const seedEvents: EventRecord[] = EVENT_SEEDS.map((seed, index) => {
  const past = seed.offsetDays < 0
  return {
    id: `evt-${index + 1}`,
    courseId: seed.courseSlug,
    courseName: courseName(seed.courseSlug),
    stateCode: 'ID',
    name: seed.name,
    eventDate: day(seed.offsetDays),
    status: past ? 'complete' : seed.headcount ? 'held' : 'reaching_out',
    headcount: seed.headcount,
    rateQuoted: seed.ratePaid,
    ratePaid: seed.ratePaid,
    firstTeeTime: seed.firstTeeTime ?? null,
    groupsHeld: seed.groupsHeld ?? null,
    headcountSentAt: seed.headcountSent
      ? ago(Math.abs(seed.offsetDays) + 7)
      : null,
    teeSheetSentAt: seed.teeSheetSent ? ago(Math.abs(seed.offsetDays) + 2) : null,
    alertsOn: seed.alertsOn ?? false,
    alertSentAt: null,
    teeGroups: null,
    source: 'sample',
    playerCount: 0,
    waitlistCount: 0,
    updatedBy: 'Mark Brinkman',
    updatedAt: ago(Math.max(1, Math.abs(seed.offsetDays) - 2)),
  }
})

export const seedPlayers: Player[] = PLAYER_SEEDS.map((seed, index) => {
  const event = seedEvents.find((e) => e.name === seed.eventName)
  return {
    id: `pl-${index + 1}`,
    eventId: event?.id ?? '',
    memberName: seed.memberName,
    phone: seed.phone,
  }
})

export const seedWaitlist: WaitlistEntry[] = WAITLIST_SEEDS.map(
  (seed, index) => {
    const event = seedEvents.find((e) => e.name === seed.eventName)
    const priorForEvent = WAITLIST_SEEDS.slice(0, index).filter(
      (s) => s.eventName === seed.eventName,
    ).length

    return {
      id: `wl-${index + 1}`,
      eventId: event?.id ?? '',
      rank: priorForEvent + 1,
      memberName: seed.memberName,
      phone: seed.phone,
      email: null,
      status: 'waiting' as const,
    }
  },
)

function seedFlight(name: string, index: number): Flight {
  if (name === 'Mark Brinkman') return 'veteran_a'
  if (name === 'Stan Collett') return 'wounded_a'
  if (name === 'Vic Romero') return 'family_a'
  return FLIGHT_IDS[index % FLIGHT_IDS.length]
}

export const seedMembers: Member[] = (() => {
  const seen = new Set<string>()
  const members: Member[] = []

  function add(name: string, phone: string | null, city: string | null) {
    const key = name.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    members.push({
      id: `mem-${members.length + 1}`,
      name,
      phone,
      city,
      flight: seedFlight(name, members.length),
    })
  }

  for (const row of [...PLAYER_SEEDS, ...WAITLIST_SEEDS]) {
    add(row.memberName, row.phone, null)
  }
  for (const row of EXTRA_MEMBER_SEEDS) {
    add(row.name, row.phone, row.city)
  }
  return members
})()

/**
 * Rolls the newest rate paid onto each course. Rate history is always derived
 * from the event log, never typed in twice.
 */
export function applyDerivedRates(
  courses: Course[],
  events: EventRecord[],
): Course[] {
  return courses.map((course) => {
    const priced = events
      .filter((e) => e.courseId === course.id && e.ratePaid !== null)
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))

    const latest = priced[0]
    return {
      ...course,
      lastNegotiatedRate: latest?.ratePaid ?? null,
      lastEventDate: latest?.eventDate ?? null,
    }
  })
}

export function buildDashboardData(
  courses: Course[],
  events: EventRecord[],
  waitlist: WaitlistEntry[],
  players: Player[] = [],
  members: Member[] = [],
): DashboardData {
  const withCounts = events.map((event) => ({
    ...event,
    playerCount: players.filter((p) => p.eventId === event.id).length,
    waitlistCount: waitlist.filter(
      (w) => w.eventId === event.id && w.status === 'waiting',
    ).length,
  }))

  return {
    courses: applyDerivedRates(courses, withCounts),
    events: withCounts,
    members,
    hasSampleData:
      courses.some((c) => c.source === 'sample') ||
      events.some((e) => e.source === 'sample'),
  }
}
