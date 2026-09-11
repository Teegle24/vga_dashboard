import type {
  ContactInput,
  Course,
  DashboardData,
  EventRecord,
  FeedbackInput,
  NewEventInput,
  WaitlistEntry,
  WaitlistStatus,
} from '@/types'
import {
  buildDashboardData,
  seedCourses,
  seedEvents,
  seedWaitlist,
} from '@/data/seed'
import { todayInIdaho } from '@/lib/dates'
import { currentStateCode } from '@/lib/state'

/**
 * The whole directory lives in the browser. Edits are mirrored to localStorage
 * so a walkthrough survives a refresh, and `resetDemoData` gives a clean slate
 * before showing someone new.
 */

const STORAGE_KEY = 'vga-dashboard.v1'

/** Whoever is driving the demo. Becomes a real signed-in user later. */
export const CURRENT_DIRECTOR = 'Mark Brinkman'

interface StoreState {
  courses: Course[]
  events: EventRecord[]
  waitlist: WaitlistEntry[]
  feedback: { message: string; at: string }[]
}

function freshState(): StoreState {
  return {
    courses: structuredClone(seedCourses),
    events: structuredClone(seedEvents),
    waitlist: structuredClone(seedWaitlist),
    feedback: [],
  }
}

let state: StoreState | null = null

function load(): StoreState {
  if (state) return state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      state = JSON.parse(raw) as StoreState
      return state
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
  return buildDashboardData(s.courses, s.events, s.waitlist)
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

  s.events.push({
    id: `evt-${Date.now()}`,
    courseId: input.courseId,
    courseName: course.name,
    stateCode: currentStateCode(),
    name: input.name,
    eventDate: input.eventDate,
    headcount: input.headcount,
    ratePaid: input.ratePaid,
    isTournament: input.isTournament,
    headcountSentAt: null,
    teeSheetSentAt: null,
    source: 'manual',
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
  save()
  return getDashboard()
}

export function restoreEvent(event: EventRecord): DashboardData {
  const s = load()
  if (!s.events.some((e) => e.id === event.id)) s.events.push(event)
  save()
  return getDashboard()
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

export function sendFeedback(input: FeedbackInput) {
  const s = load()
  s.feedback.push({ message: input.message, at: nowIso() })
  save()
}

/** Everything Mark has typed in, for reading back after a walkthrough. */
export function collectedFeedback() {
  return load().feedback
}
