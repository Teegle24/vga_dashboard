/** The shape of everything in the directory. */

export type StateCode = 'ID'

/** Where a row came from. `sample` rows are demo data and say so in the UI. */
export type DataSource = 'manual' | 'sample'

/**
 * Where a stroke-play tournament sits in the director's job:
 * call the course, hold the times, confirm the field, then it's played.
 */
export type TournamentStatus = 'reaching_out' | 'held' | 'confirmed' | 'complete'

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
  /** Derived from the most recent completed tournament. Never edited by hand. */
  lastNegotiatedRate: number | null
  lastEventDate: string | null
  contact: CourseContact
}

/** One starting-hole group. VGA plays stroke play in foursomes. */
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
  /** Calendar day, `YYYY-MM-DD`. Not a timestamp. */
  eventDate: string
  status: TournamentStatus
  headcount: number | null
  /** Quoted when the date is held. Becomes ratePaid once the round is played. */
  rateQuoted: number | null
  ratePaid: number | null
  firstTeeTime: string | null
  groupsHeld: number | null
  headcountSentAt: string | null
  teeSheetSentAt: string | null
  /** Participant texts, 3–5 days out. Separate from any course-alert list. */
  alertsOn: boolean
  alertSentAt: string | null
  teeGroups: TeeGroup[] | null
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
  rateQuoted: number | null
  firstTeeTime: string | null
  groupsHeld: number | null
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
