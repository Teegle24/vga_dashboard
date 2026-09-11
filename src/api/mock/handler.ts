import type {
  ContactInput,
  DashboardData,
  EventRecord,
  FeedbackInput,
  NewEventInput,
  WaitlistEntry,
  WaitlistStatus,
} from '@shared/types'
import {
  buildDashboardData,
  mockCourses,
  mockEvents,
  mockWaitlist,
} from '@/api/mock/data'
import { todayInIdaho } from '@/lib/dates'

/**
 * In-memory API used when VITE_USE_MOCK is on. State is mirrored to
 * localStorage so a demo survives a page refresh, and `resetMockState` gives a
 * clean slate before a walkthrough.
 */

const STORAGE_KEY = 'vga-dashboard.mock.v1'

interface MockState {
  courses: typeof mockCourses
  events: EventRecord[]
  waitlist: WaitlistEntry[]
  feedback: { message: string; at: string }[]
}

function seedState(): MockState {
  return {
    courses: structuredClone(mockCourses),
    events: structuredClone(mockEvents),
    waitlist: structuredClone(mockWaitlist),
    feedback: [],
  }
}

let state: MockState | null = null

function load(): MockState {
  if (state) return state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      state = JSON.parse(raw) as MockState
      return state
    }
  } catch {
    // Corrupt or unavailable storage just means we start from seed.
  }
  state = seedState()
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

export function resetMockState() {
  state = seedState()
  save()
}

function dashboard(): DashboardData {
  const s = load()
  return buildDashboardData(s.courses, s.events, s.waitlist)
}

function nowIso() {
  return new Date().toISOString()
}

const DEMO_ACTOR = 'Mark Brinkman'

function updateContact(courseId: string, input: ContactInput) {
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
    updatedBy: DEMO_ACTOR,
  }
  // A contact the director just typed is no longer sample data.
  if (course.source === 'sample') course.source = 'manual'
  save()
  return dashboard()
}

function addEvent(input: NewEventInput) {
  const s = load()
  const course = s.courses.find((c) => c.id === input.courseId)
  if (!course) throw new Error('Course not found')

  s.events.push({
    id: `evt-${Date.now()}`,
    courseId: input.courseId,
    courseName: course.name,
    stateCode: 'ID',
    name: input.name,
    eventDate: input.eventDate,
    headcount: input.headcount,
    ratePaid: input.ratePaid,
    isTournament: input.isTournament,
    headcountSentAt: null,
    teeSheetSentAt: null,
    source: 'manual',
    waitlistCount: 0,
    updatedBy: DEMO_ACTOR,
    updatedAt: nowIso(),
  })
  save()
  return dashboard()
}

function patchEvent(id: string, patch: Partial<EventRecord>) {
  const s = load()
  const event = s.events.find((e) => e.id === id)
  if (!event) throw new Error('Event not found')
  Object.assign(event, patch, { updatedAt: nowIso(), updatedBy: DEMO_ACTOR })
  save()
  return dashboard()
}

function deleteEvent(id: string) {
  const s = load()
  s.events = s.events.filter((e) => e.id !== id)
  s.waitlist = s.waitlist.filter((w) => w.eventId !== id)
  save()
  return dashboard()
}

function restoreEvent(event: EventRecord) {
  const s = load()
  if (!s.events.some((e) => e.id === event.id)) s.events.push(event)
  save()
  return dashboard()
}

function listWaitlist(eventId: string) {
  return load()
    .waitlist.filter((w) => w.eventId === eventId)
    .sort((a, b) => a.rank - b.rank)
}

function addWaitlist(eventId: string, memberName: string, phone: string | null) {
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

function patchWaitlist(
  id: string,
  patch: { status?: WaitlistStatus; direction?: 'up' | 'down' },
) {
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

function removeWaitlist(id: string) {
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

function addFeedback(input: FeedbackInput) {
  const s = load()
  s.feedback.push({ message: input.message, at: nowIso() })
  save()
  return { ok: true }
}

/** Mirrors the shape of a fetch against the real API. */
export async function mockRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  // A touch of latency so loading states are real in the demo.
  await new Promise((resolve) => setTimeout(resolve, 120))

  const waitlistMatch = path.match(/^\/events\/([^/]+)\/waitlist$/)
  const eventMatch = path.match(/^\/events\/([^/]+)$/)
  const restoreMatch = path.match(/^\/events\/([^/]+)\/restore$/)
  const contactMatch = path.match(/^\/courses\/([^/]+)\/contact$/)
  const waitlistItemMatch = path.match(/^\/waitlist\/([^/]+)$/)

  if (method === 'GET' && path === '/dashboard') return dashboard() as T
  if (method === 'GET' && waitlistMatch) {
    return listWaitlist(waitlistMatch[1]!) as T
  }
  if (method === 'PUT' && contactMatch) {
    return updateContact(contactMatch[1]!, body as ContactInput) as T
  }
  if (method === 'POST' && path === '/events') {
    return addEvent(body as NewEventInput) as T
  }
  if (method === 'PATCH' && eventMatch) {
    return patchEvent(eventMatch[1]!, body as Partial<EventRecord>) as T
  }
  if (method === 'DELETE' && eventMatch) {
    return deleteEvent(eventMatch[1]!) as T
  }
  if (method === 'POST' && restoreMatch) {
    return restoreEvent(body as EventRecord) as T
  }
  if (method === 'POST' && waitlistMatch) {
    const input = body as { memberName: string; phone: string | null }
    return addWaitlist(waitlistMatch[1]!, input.memberName, input.phone) as T
  }
  if (method === 'PATCH' && waitlistItemMatch) {
    return patchWaitlist(
      waitlistItemMatch[1]!,
      body as { status?: WaitlistStatus; direction?: 'up' | 'down' },
    ) as T
  }
  if (method === 'DELETE' && waitlistItemMatch) {
    return removeWaitlist(waitlistItemMatch[1]!) as T
  }
  if (method === 'POST' && path === '/feedback') {
    return addFeedback(body as FeedbackInput) as T
  }

  throw new Error(`No mock handler for ${method} ${path}`)
}
