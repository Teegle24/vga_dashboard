export const FLIGHT_IDS = [
  'veteran_a',
  'veteran_b',
  'veteran_c',
  'veteran_d',
  'senior_a',
  'senior_b',
  'senior_c',
  'senior_d',
  'family_a',
  'family_b',
  'family_c',
  'family_d',
  'wounded_a',
  'wounded_b',
  'wounded_c',
  'wounded_d',
] as const

export type Flight = (typeof FLIGHT_IDS)[number]

export type FlightGroup = 'veteran' | 'senior' | 'family' | 'wounded'

export const FLIGHTS: {
  id: Flight
  label: string
  group: FlightGroup
}[] = [
  { id: 'veteran_a', label: 'Veteran Flight A', group: 'veteran' },
  { id: 'veteran_b', label: 'Veteran Flight B', group: 'veteran' },
  { id: 'veteran_c', label: 'Veteran Flight C', group: 'veteran' },
  { id: 'veteran_d', label: 'Veteran Flight D', group: 'veteran' },
  { id: 'senior_a', label: 'Senior Flight A', group: 'senior' },
  { id: 'senior_b', label: 'Senior Flight B', group: 'senior' },
  { id: 'senior_c', label: 'Senior Flight C', group: 'senior' },
  { id: 'senior_d', label: 'Senior Flight D', group: 'senior' },
  { id: 'family_a', label: 'Family Flight A', group: 'family' },
  { id: 'family_b', label: 'Family Flight B', group: 'family' },
  { id: 'family_c', label: 'Family Flight C', group: 'family' },
  { id: 'family_d', label: 'Family Flight D', group: 'family' },
  { id: 'wounded_a', label: 'Wounded Veteran Flight A', group: 'wounded' },
  { id: 'wounded_b', label: 'Wounded Veteran Flight B', group: 'wounded' },
  { id: 'wounded_c', label: 'Wounded Veteran Flight C', group: 'wounded' },
  { id: 'wounded_d', label: 'Wounded Veteran Flight D', group: 'wounded' },
]

export const FLIGHT_GROUPS: { id: FlightGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All flights' },
  { id: 'veteran', label: 'Veteran' },
  { id: 'senior', label: 'Senior' },
  { id: 'family', label: 'Family' },
  { id: 'wounded', label: 'Wounded Veteran' },
]

const BY_ID = new Map(FLIGHTS.map((flight) => [flight.id, flight]))

export function isFlight(value: unknown): value is Flight {
  return typeof value === 'string' && BY_ID.has(value as Flight)
}

export function flightLabel(flight: Flight | null | undefined): string {
  return flight ? (BY_ID.get(flight)?.label ?? 'No flight yet') : 'No flight yet'
}

export function flightGroup(flight: Flight | null | undefined): FlightGroup | null {
  return flight ? (BY_ID.get(flight)?.group ?? null) : null
}

export function flightSortIndex(flight: Flight | null | undefined): number {
  if (!flight) return FLIGHT_IDS.length
  const index = FLIGHT_IDS.indexOf(flight)
  return index === -1 ? FLIGHT_IDS.length : index
}

export function flightForName(
  members: { name: string; flight: Flight | null }[],
  name: string,
): Flight | null {
  const key = name.trim().toLowerCase()
  return members.find((member) => member.name.toLowerCase() === key)?.flight ?? null
}
