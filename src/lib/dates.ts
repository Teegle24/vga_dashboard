/**
 * All calendar math for the app. Event dates are calendar days in Idaho, not
 * instants, so everything here works on `YYYY-MM-DD` strings resolved against
 * America/Boise rather than the browser's local midnight.
 */

const ZONE = 'America/Boise'

/** Today in Idaho as `YYYY-MM-DD`. */
export function todayInIdaho(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which is what we want to compare as strings.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function toUtcNoon(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  // Noon UTC keeps us clear of DST edges on both sides.
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12)
}

/** Whole days from today until `isoDate`. Negative means it already happened. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const diff = toUtcNoon(isoDate) - toUtcNoon(todayInIdaho(now))
  return Math.round(diff / 86_400_000)
}

/**
 * The headcount nudge window. Deliberately 6-8 days rather than exactly 7 so a
 * skipped or delayed cron run can't silently step over an event.
 */
export function isHeadcountDue(isoDate: string, now: Date = new Date()): boolean {
  const days = daysUntil(isoDate, now)
  return days >= 6 && days <= 8
}

/** Player reminder window: text the field 3–5 days before the round. */
export function isAlertDue(isoDate: string, now: Date = new Date()): boolean {
  const days = daysUntil(isoDate, now)
  return days >= 3 && days <= 5
}

export function isPast(isoDate: string, now: Date = new Date()): boolean {
  return daysUntil(isoDate, now) < 0
}

/** Same month and day as last year, rolled forward until it is still ahead. */
export function nextSeasonDate(
  lastPlayed: string,
  today: string = todayInIdaho(),
): string {
  const [, month, rawDay] = lastPlayed.split('-')
  const day = Number(rawDay)
  if (!month || !day) return today

  let year = Number(today.slice(0, 4))
  let candidate = clampMonthDay(year, month, day)
  if (candidate <= today) {
    candidate = clampMonthDay(year + 1, month, day)
  }
  return candidate
}

function clampMonthDay(year: number, month: string, day: number): string {
  const last = new Date(Date.UTC(year, Number(month), 0, 12)).getUTCDate()
  return `${year}-${month}-${String(Math.min(day, last)).padStart(2, '0')}`
}

/** "May 2" */
export function formatMonthDay(isoDate: string | null): string {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d, 12)))
}

/** "Mar 14, 2026" */
export function formatDate(isoDate: string | null): string {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d, 12)))
}

/** Plain-language countdown for the tournament cards. */
export function describeWhen(isoDate: string, now: Date = new Date()): string {
  const days = daysUntil(isoDate, now)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days < 14) return `In ${days} days`
  if (days < 60) return `In ${Math.round(days / 7)} weeks`
  return formatDate(isoDate)
}

/** Relative wording for "who touched this last", e.g. "Updated 3 days ago". */
export function describeUpdated(timestamp: string | null): string | null {
  if (!timestamp) return null
  const then = new Date(timestamp)
  if (Number.isNaN(then.getTime())) return null
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`

  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30))
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }

  const years = Math.max(1, Math.round(days / 365))
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}
