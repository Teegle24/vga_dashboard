import type { EventRecord } from '@/types'
import { formatDate } from '@/lib/dates'

/**
 * Builds the tee sheet VGA emails to a course a couple of days before an event.
 * Groups are foursomes on a shotgun-style interval; player names are left blank
 * because the roster lives in Golf Genius, and Mark fills them in before sending.
 */

const GROUP_SIZE = 4
const INTERVAL_MINUTES = 10
const DEFAULT_START = '08:00'

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const display = hh % 12 === 0 ? 12 : hh % 12
  return `${display}:${String(mm).padStart(2, '0')} ${suffix}`
}

export function buildTeeSheet(
  event: EventRecord,
  startTime: string = DEFAULT_START,
): string {
  const headcount = event.headcount ?? 0
  const groups = Math.max(1, Math.ceil(headcount / GROUP_SIZE))

  const lines: string[] = [
    `${event.name} — Veteran Golfers Association, Idaho`,
    event.courseName,
    formatDate(event.eventDate),
    `Total players: ${headcount}`,
    '',
    'Tee Time, Group, Player 1, Player 2, Player 3, Player 4',
  ]

  let remaining = headcount
  for (let i = 0; i < groups; i += 1) {
    const inGroup = Math.min(GROUP_SIZE, remaining)
    remaining -= inGroup
    const slots = Array.from({ length: GROUP_SIZE }, (_, slot) =>
      slot < inGroup ? '' : '(open)',
    )
    lines.push(
      [addMinutes(startTime, i * INTERVAL_MINUTES), `Group ${i + 1}`, ...slots].join(
        ', ',
      ),
    )
  }

  lines.push('', 'Questions: contact the VGA Idaho director listed on this event.')
  return lines.join('\n')
}

export function downloadTeeSheet(event: EventRecord) {
  const contents = buildTeeSheet(event)
  const safeName = `${event.courseName}-${event.eventDate}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tee-sheet-${safeName}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) =>
    /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
  const contents = rows.map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
