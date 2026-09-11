/** The shape of everything in the directory. */

export type StateCode = 'ID'

/** Where a row came from. `sample` rows are demo data and say so in the UI. */
export type DataSource = 'manual' | 'sample'

export interface CourseContact {
  contactName: string | null
  email: string | null
  phone: string | null
  /** Last time a director confirmed this contact is still correct. */
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
  /** The course's main phone line, from the source dataset. */
  phone: string | null
  website: string | null
  source: DataSource
  teegleCourseId: string | null
  /** Standard published rate, director-maintained. */
  listRate: number | null
  /** Derived from the most recent logged event. Never edited by hand. */
  lastNegotiatedRate: number | null
  lastEventDate: string | null
  contact: CourseContact
}

export interface EventRecord {
  id: string
  courseId: string
  courseName: string
  stateCode: StateCode
  name: string
  /** Calendar day, `YYYY-MM-DD`. Not a timestamp. */
  eventDate: string
  headcount: number | null
  ratePaid: number | null
  isTournament: boolean
  headcountSentAt: string | null
  teeSheetSentAt: string | null
  source: DataSource
  waitlistCount: number
  updatedBy: string | null
  updatedAt: string | null
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

export interface DashboardData {
  courses: Course[]
  events: EventRecord[]
  /** True when any `sample` rows are present, so the UI can say so plainly. */
  hasSampleData: boolean
}

export interface NewEventInput {
  courseId: string
  name: string
  eventDate: string
  headcount: number | null
  ratePaid: number | null
  isTournament: boolean
}

export interface ContactInput {
  contactName: string | null
  email: string | null
  phone: string | null
  notes: string | null
  /** Set when the director taps "This is still correct". */
  confirmNow?: boolean
}

export interface FeedbackInput {
  message: string
  context?: Record<string, unknown>
}

/** Tee sheet row in the shape courses expect over email. */
export interface TeeSheetRow {
  teeTime: string
  players: string
}
