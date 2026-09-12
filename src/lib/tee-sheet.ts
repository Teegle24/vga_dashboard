import type { EventRecord, TeeGroup } from '@/types'
import { formatDate } from '@/lib/dates'

/**
 * Tee sheet: foursomes off the first tee at a regular interval.
 * VGA does not play scramble or shotgun starts.
 */

export const GROUP_SIZE = 4
export const INTERVAL_MINUTES = 10
export const DEFAULT_START = '08:00'

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 8) * 60 + (m ?? 0)
}

export function formatTeeTime(minutes: number): string {
  const total = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = Math.floor(total / 60)
  const mm = total % 60
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const display = hh % 12 === 0 ? 12 : hh % 12
  return `${display}:${String(mm).padStart(2, '0')} ${suffix}`
}

export function toInputTime(displayOrInput: string): string {
  if (/^\d{1,2}:\d{2}$/.test(displayOrInput)) {
    const [h, m] = displayOrInput.split(':')
    return `${String(h).padStart(2, '0')}:${m}`
  }
  return displayOrInput
}

export function generateTeeGroups(
  headcount: number,
  firstTeeTime: string = DEFAULT_START,
): TeeGroup[] {
  const players = Math.max(0, headcount)
  const groups = Math.max(1, Math.ceil((players || GROUP_SIZE) / GROUP_SIZE))
  const start = parseMinutes(toInputTime(firstTeeTime))
  let remaining = players

  return Array.from({ length: groups }, (_, i) => {
    const inGroup = players === 0 ? 0 : Math.min(GROUP_SIZE, remaining)
    remaining -= inGroup
    return {
      teeTime: formatTeeTime(start + i * INTERVAL_MINUTES),
      players: Array.from({ length: GROUP_SIZE }, (_, slot) =>
        slot < inGroup ? '' : '',
      ),
    }
  })
}

export function groupsForEvent(event: EventRecord): TeeGroup[] {
  if (event.teeGroups && event.teeGroups.length > 0) return event.teeGroups
  const count = event.headcount ?? (event.groupsHeld ?? 0) * GROUP_SIZE
  return generateTeeGroups(count, event.firstTeeTime ?? DEFAULT_START)
}

/** Keep the names in each foursome; slide the times to a new first tee. */
export function retimedGroups(
  groups: TeeGroup[],
  firstTeeTime: string,
): TeeGroup[] {
  const start = parseMinutes(toInputTime(firstTeeTime || DEFAULT_START))
  return groups.map((group, i) => ({
    ...group,
    teeTime: formatTeeTime(start + i * INTERVAL_MINUTES),
  }))
}

export function downloadTeeSheet(event: EventRecord) {
  const groups = groupsForEvent(event)
  const filled = groups.reduce(
    (sum, g) => sum + g.players.filter((p) => p.trim()).length,
    0,
  )
  const lines: string[] = [
    `${event.name} — Veteran Golfers Association, Idaho`,
    event.courseName,
    formatDate(event.eventDate),
    `Players listed: ${filled || event.headcount || 0}`,
    '',
    'Tee Time, Group, Player 1, Player 2, Player 3, Player 4',
  ]

  groups.forEach((group, i) => {
    const slots = Array.from(
      { length: GROUP_SIZE },
      (_, slot) => group.players[slot]?.trim() || '',
    )
    lines.push([group.teeTime, `Group ${i + 1}`, ...slots].join(', '))
  })

  lines.push('', 'Questions: contact the VGA Idaho director listed on this tournament.')

  const safeName = `${event.courseName}-${event.eventDate}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
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
