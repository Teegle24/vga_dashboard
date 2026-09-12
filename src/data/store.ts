import type {
  ContactInput,
  Course,
  DashboardData,
  EventRecord,
  FeedbackInput,
  Member,
  NewEventInput,
  NewMemberInput,
  Player,
  WaitlistEntry,
  WaitlistStatus,
} from '@/types'
import {
  buildDashboardData,
  seedCourses,
  seedEvents,
  seedMembers,
  seedPlayers,
  seedWaitlist,
} from '@/data/seed'
import { isFlight } from '@/lib/flights'
import { todayInIdaho } from '@/lib/dates'
import { currentStateCode } from '@/lib/state'

/**
 * The whole directory lives in the browser. Edits are mirrored to localStorage
 * so a walkthrough survives a refresh, and `resetDemoData` gives a clean slate
 * before showing someone new.
 */

const STORAGE_KEY = 'vga-dashboard.v5'

/** Whoever is driving the demo. Becomes a real signed-in user later. */
export const CURRENT_DIRECTOR = 'Mark Brinkman'

interface StoreState {
  courses: Course[]
  events: EventRecord[]
  players: Player[]
  members: Member[]
  waitlist: WaitlistEntry[]
  feedback: { message: string; at: string }[]
}

function freshState(): StoreState {
  return {
    courses: structuredClone(seedCourses),
    events: structuredClone(seedEvents),
    players: structuredClone(seedPlayers),
    members: structuredClone(seedMembers),
    waitlist: structuredClone(seedWaitlist),
    feedback: [],
  }
}

let state: StoreState | null = null

function hasRoster(value: StoreState): boolean {
  return (
    Array.isArray(value.players) &&
    Array.isArray(value.waitlist) &&
    Array.isArray(value.members)
  )
}

function normalizeStore(value: StoreState): StoreState {
  return {
    ...value,
    members: value.members.map((member) => ({
      ...member,
      flight: isFlight(member.flight) ? member.flight : null,
    })),
  }
}

function load(): StoreState {
  if (state && hasRoster(state)) return state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState
      if (hasRoster(parsed)) {
        state = normalizeStore(parsed)
        return state
      }
    }
  } catch {
    // Corrupt or unavailable storage just means we start from seed.
  }
  state = freshState()
  return state
}

function save() {
  if (!state) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private browsing or a full quota shouldn't break the demo.
  }
}

export function resetDemoData() {
  state = freshState()
  save()
}

function nowIso() {
  return new Date().toISOString()
}

export function getDashboard(): DashboardData {
  const s = load()
  return buildDashboardData(
    s.courses,
    s.events,
    s.waitlist,
    s.players,
    s.members,
  )
}

export function saveContact(
  courseId: string,
  input: ContactInput,
): DashboardData {
  const s = load()
  const course = s.courses.find((c) => c.id === courseId)
  if (!course) throw new Error('Course not found')

  course.contact = {
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
    lastConfirmedDate: input.confirmNow
      ? todayInIdaho()
      : course.contact.lastConfirmedDate,
    updatedAt: nowIso(),
    updatedBy: CURRENT_DIRECTOR,
  }
  // A contact the director just typed is no longer sample data.
  if (course.source === 'sample') course.source = 'manual'
  save()
  return getDashboard()
}

export function logEvent(input: NewEventInput): DashboardData {
  const s = load()
  const course = s.courses.find((c) => c.id === input.courseId)
  if (!course) throw new Error('Course not found')

  const past = input.eventDate < todayInIdaho()
  s.events.push({
    id: `evt-${Date.now()}`,
    courseId: input.courseId,
    courseName: course.name,
    stateCode: currentStateCode(),
    name: input.name,
    eventDate: input.eventDate,
    status: past ? 'complete' : input.headcount ? 'held' : 'reaching_out',
    headcount: input.headcount,
    rateQuoted: input.rateQuoted,
    ratePaid: past ? input.rateQuoted : null,
    firstTeeTime: input.firstTeeTime,
    groupsHeld: input.groupsHeld,
    headcountSentAt: null,
    teeSheetSentAt: null,
    alertsOn: false,
    alertSentAt: null,
    teeGroups: null,
    source: 'manual',
    playerCount: 0,
    waitlistCount: 0,
    updatedBy: CURRENT_DIRECTOR,
    updatedAt: nowIso(),
  })
  save()
  return getDashboard()
}

export function patchEvent(
  id: string,
  patch: Partial<EventRecord>,
): DashboardData {
  const s = load()
  const event = s.events.find((e) => e.id === id)
  if (!event) throw new Error('Event not found')
  Object.assign(event, patch, {
    updatedAt: nowIso(),
    updatedBy: CURRENT_DIRECTOR,
  })
  save()
  return getDashboard()
}

export function deleteEvent(id: string): DashboardData {
  const s = load()
  s.events = s.events.filter((e) => e.id !== id)
  s.waitlist = s.waitlist.filter((w) => w.eventId !== id)
  s.players = s.players.filter((p) => p.eventId !== id)
  save()
  return getDashboard()
}

export function restoreEvent(event: EventRecord): DashboardData {
  const s = load()
  if (!s.events.some((e) => e.id === event.id)) s.events.push(event)
  save()
  return getDashboard()
}

export function listAllPlayers(): Player[] {
  return load().players.slice()
}

export function listAllWaitlist(): WaitlistEntry[] {
  return load().waitlist.slice()
}

export function listPlayers(eventId: string): Player[] {
  return load().players.filter((p) => p.eventId === eventId)
}

export function addPlayer(
  eventId: string,
  memberName: string,
  phone: string | null,
): Player[] {
  const s = load()
  s.players.push({
    id: `pl-${Date.now()}`,
    eventId,
    memberName,
    phone,
  })
  ensureMember(memberName, phone)
  save()
  return listPlayers(eventId)
}

export function removePlayer(id: string): Player[] {
  const s = load()
  const player = s.players.find((p) => p.id === id)
  s.players = s.players.filter((p) => p.id !== id)
  save()
  return player ? listPlayers(player.eventId) : []
}

/** Last-minute no-show: take them off the field and put them last on standby. */
export function movePlayerToStandby(id: string): {
  players: Player[]
  waitlist: WaitlistEntry[]
} {
  const s = load()
  const player = s.players.find((p) => p.id === id)
  if (!player) throw new Error('Player not found')
  s.players = s.players.filter((p) => p.id !== id)
  save()
  addWaitlistEntry(player.eventId, player.memberName, player.phone)
  return {
    players: listPlayers(player.eventId),
    waitlist: listWaitlist(player.eventId),
  }
}

/** First on standby gets the open spot. */
export function promoteToField(waitlistId: string): {
  players: Player[]
  waitlist: WaitlistEntry[]
} {
  const s = load()
  const entry = s.waitlist.find((w) => w.id === waitlistId)
  if (!entry) throw new Error('Waitlist entry not found')
  addPlayer(entry.eventId, entry.memberName, entry.phone)
  entry.status = 'filled'
  save()
  return {
    players: listPlayers(entry.eventId),
    waitlist: listWaitlist(entry.eventId),
  }
}

export function listWaitlist(eventId: string): WaitlistEntry[] {
  return load()
    .waitlist.filter((w) => w.eventId === eventId)
    .sort((a, b) => a.rank - b.rank)
}

export function addWaitlistEntry(
  eventId: string,
  memberName: string,
  phone: string | null,
): WaitlistEntry[] {
  const s = load()
  const existing = listWaitlist(eventId)
  s.waitlist.push({
    id: `wl-${Date.now()}`,
    eventId,
    rank: existing.length + 1,
    memberName,
    phone,
    email: null,
    status: 'waiting',
  })
  ensureMember(memberName, phone)
  save()
  return listWaitlist(eventId)
}

export function patchWaitlistEntry(
  id: string,
  patch: { status?: WaitlistStatus; direction?: 'up' | 'down' },
): WaitlistEntry[] {
  const s = load()
  const entry = s.waitlist.find((w) => w.id === id)
  if (!entry) throw new Error('Waitlist entry not found')

  if (patch.status) entry.status = patch.status

  if (patch.direction) {
    const siblings = listWaitlist(entry.eventId)
    const index = siblings.findIndex((w) => w.id === id)
    const swapWith = patch.direction === 'up' ? index - 1 : index + 1
    const target = siblings[swapWith]
    if (target) {
      const tmp = entry.rank
      entry.rank = target.rank
      target.rank = tmp
    }
  }

  save()
  return listWaitlist(entry.eventId)
}

export function removeWaitlistEntry(id: string): WaitlistEntry[] {
  const s = load()
  const entry = s.waitlist.find((w) => w.id === id)
  const eventId = entry?.eventId
  s.waitlist = s.waitlist.filter((w) => w.id !== id)
  // Close the gap so ranks stay 1..n
  if (eventId) {
    listWaitlist(eventId).forEach((w, i) => {
      w.rank = i + 1
    })
  }
  save()
  return eventId ? listWaitlist(eventId) : []
}

export function listMembers(): Member[] {
  return load()
    .members.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
}

function ensureMember(name: string, phone: string | null) {
  const s = load()
  const key = name.trim().toLowerCase()
  if (s.members.some((m) => m.name.toLowerCase() === key)) return
  s.members.push({
    id: `mem-${Date.now()}`,
    name: name.trim(),
    phone,
    city: null,
    flight: null,
  })
}

export function addMember(input: NewMemberInput): DashboardData {
  const s = load()
  const name = input.name.trim()
  if (name) {
    const existing = s.members.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) {
      existing.phone = input.phone ?? existing.phone
      existing.city = input.city ?? existing.city
      if (input.flight) existing.flight = input.flight
    } else {
      s.members.push({
        id: `mem-${Date.now()}`,
        name,
        phone: input.phone,
        city: input.city,
        flight: input.flight,
      })
    }
    save()
  }
  return getDashboard()
}

export function patchMember(
  id: string,
  patch: Partial<Pick<Member, 'flight' | 'phone' | 'city'>>,
): DashboardData {
  const s = load()
  const member = s.members.find((m) => m.id === id)
  if (!member) throw new Error('Member not found')
  if (patch.phone !== undefined) member.phone = patch.phone
  if (patch.city !== undefined) member.city = patch.city
  if (patch.flight !== undefined) {
    member.flight = patch.flight && isFlight(patch.flight) ? patch.flight : null
  }
  save()
  return getDashboard()
}

export function sendFeedback(input: FeedbackInput) {
  const s = load()
  s.feedback.push({ message: input.message, at: nowIso() })
  save()
}

/** Everything Mark has typed in, for reading back after a walkthrough. */
export function collectedFeedback() {
  return load().feedback
}
