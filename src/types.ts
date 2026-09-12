/** The shape of everything in the directory. */

import type { Flight } from '@/lib/flights'

export type { Flight }

export type StateCode = 'ID'

/** Where a row came from. `sample` rows are demo data and say so in the UI. */
export type DataSource = 'manual' | 'sample'

/**
 * Where a tournament sits in the director's job:
 * call the course, hold the times, confirm the field, then it's played.
 */
export type TournamentStatus = 'reaching_out' | 'held' | 'confirmed' | 'complete'

export interface CourseContact {
  contactName: string | null
  email: string | null
  phone: string | null
  lastConfirmedDate: string | null
  notes: string | null
  updatedAt: string | null
  updatedBy: string | null
}

export interface Course {
  id: string
  name: string
  address: string | null
  city: string | null
  stateCode: StateCode
  zip: string | null
  phone: string | null
  website: string | null
  source: DataSource
  teegleCourseId: string | null
  listRate: number | null
  lastNegotiatedRate: number | null
  lastEventDate: string | null
  contact: CourseContact
}

export interface TeeGroup {
  teeTime: string
  players: string[]
}

export interface EventRecord {
  id: string
  courseId: string
  courseName: string
  stateCode: StateCode
  name: string
  eventDate: string
  status: TournamentStatus
  headcount: number | null
  rateQuoted: number | null
  ratePaid: number | null
  firstTeeTime: string | null
  groupsHeld: number | null
  headcountSentAt: string | null
  teeSheetSentAt: string | null
  alertsOn: boolean
  alertSentAt: string | null
  teeGroups: TeeGroup[] | null
  source: DataSource
  playerCount: number
  waitlistCount: number
  updatedBy: string | null
  updatedAt: string | null
}

export interface Player {
  id: string
  eventId: string
  memberName: string
  phone: string | null
}

export type WaitlistStatus = 'waiting' | 'offered' | 'filled' | 'declined'

export interface WaitlistEntry {
  id: string
  eventId: string
  rank: number
  memberName: string
  phone: string | null
  email: string | null
  status: WaitlistStatus
}

export interface Member {
  id: string
  name: string
  phone: string | null
  city: string | null
  flight: Flight | null
}

export interface DashboardData {
  courses: Course[]
  events: EventRecord[]
  members: Member[]
  hasSampleData: boolean
}

export interface NewEventInput {
  courseId: string
  name: string
  eventDate: string
  headcount: number | null
  rateQuoted: number | null
  firstTeeTime: string | null
  groupsHeld: number | null
}

export interface ContactInput {
  contactName: string | null
  email: string | null
  phone: string | null
  notes: string | null
  confirmNow?: boolean
}

export interface FeedbackInput {
  message: string
  context?: Record<string, unknown>
}

export interface NewMemberInput {
  name: string
  phone: string | null
  city: string | null
  flight: Flight | null
}
