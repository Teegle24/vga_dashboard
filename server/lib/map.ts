import type { Course, EventRecord, WaitlistEntry } from '@shared/types'

/** Postgres rows are snake_case; the shared types are camelCase. */

interface ContactRow {
  contact_name: string | null
  email: string | null
  phone: string | null
  last_confirmed_date: string | null
  notes: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface CourseRow {
  id: string
  name: string
  address: string | null
  city: string | null
  state_code: string
  zip: string | null
  phone: string | null
  website: string | null
  source: string
  teegle_course_id: string | null
  list_rate: number | null
  last_negotiated_rate: number | null
  last_event_date: string | null
  course_contacts: ContactRow[] | ContactRow | null
}

export interface EventRow {
  id: string
  course_id: string
  state_code: string
  name: string
  event_date: string
  headcount: number | null
  rate_paid: number | null
  is_tournament: boolean
  headcount_sent_at: string | null
  tee_sheet_sent_at: string | null
  source: string
  updated_by: string | null
  updated_at: string | null
  courses?: { name: string } | null
}

export interface WaitlistRow {
  id: string
  event_id: string
  rank: number
  member_name: string
  phone: string | null
  email: string | null
  status: string
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

export function toCourse(row: CourseRow): Course {
  const joined = Array.isArray(row.course_contacts)
    ? row.course_contacts[0]
    : row.course_contacts

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    stateCode: row.state_code as Course['stateCode'],
    zip: row.zip,
    phone: row.phone,
    website: row.website,
    source: row.source as Course['source'],
    teegleCourseId: row.teegle_course_id,
    listRate: row.list_rate,
    lastNegotiatedRate: row.last_negotiated_rate,
    lastEventDate: row.last_event_date,
    contact: joined
      ? {
          contactName: joined.contact_name,
          email: joined.email,
          phone: joined.phone,
          lastConfirmedDate: joined.last_confirmed_date,
          notes: joined.notes,
          updatedAt: joined.updated_at,
          updatedBy: joined.updated_by,
        }
      : EMPTY_CONTACT,
  }
}

export function toEvent(row: EventRow, waitlistCount = 0): EventRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.courses?.name ?? '',
    stateCode: row.state_code as EventRecord['stateCode'],
    name: row.name,
    eventDate: row.event_date,
    headcount: row.headcount,
    ratePaid: row.rate_paid,
    isTournament: row.is_tournament,
    headcountSentAt: row.headcount_sent_at,
    teeSheetSentAt: row.tee_sheet_sent_at,
    source: row.source as EventRecord['source'],
    waitlistCount,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  }
}

export function toWaitlistEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    eventId: row.event_id,
    rank: row.rank,
    memberName: row.member_name,
    phone: row.phone,
    email: row.email,
    status: row.status as WaitlistEntry['status'],
  }
}
