import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { EventRecord, Member, Player, WaitlistEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SelectField, TextField } from '@/components/ui/field'
import { useAddMember, usePatchMember } from '@/data/hooks'
import { formatDate, isPast } from '@/lib/dates'
import {
  FLIGHT_GROUPS,
  FLIGHTS,
  flightGroup,
  flightLabel,
  flightSortIndex,
  type Flight,
  type FlightGroup,
} from '@/lib/flights'
import { formatPhone, telHref } from '@/lib/format'
import { cn } from '@/lib/utils'

function filterMembers(
  members: Member[],
  query: string,
  group: FlightGroup | 'all',
): Member[] {
  const q = query.trim().toLowerCase()
  return members.filter((m) => {
    if (group !== 'all' && flightGroup(m.flight) !== group) return false
    if (!q) return true
    return (
      m.name.toLowerCase().includes(q) ||
      (m.city ?? '').toLowerCase().includes(q) ||
      (m.phone ?? '').includes(q) ||
      flightLabel(m.flight).toLowerCase().includes(q)
    )
  })
}

function memberRounds(
  name: string,
  events: EventRecord[],
  players: Player[],
  waitlist: WaitlistEntry[],
) {
  const key = name.toLowerCase()
  const fieldIds = new Set(
    players.filter((p) => p.memberName.toLowerCase() === key).map((p) => p.eventId),
  )
  const standbyIds = new Set(
    waitlist
      .filter((w) => w.memberName.toLowerCase() === key && w.status === 'waiting')
      .map((w) => w.eventId),
  )

  return events
    .filter((event) => fieldIds.has(event.id) || standbyIds.has(event.id))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .map((event) => ({
      event,
      onStandby: standbyIds.has(event.id) && !fieldIds.has(event.id),
    }))
}

export function MembersDirectory({
  members,
  events,
  players,
  waitlist,
}: {
  members: Member[]
  events: EventRecord[]
  players: Player[]
  waitlist: WaitlistEntry[]
}) {
  const add = useAddMember()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<FlightGroup | 'all'>('all')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [flight, setFlight] = useState<Flight | ''>('')

  const visible = useMemo(() => {
    const sorted = members.slice().sort((a, b) => {
      const byFlight = flightSortIndex(a.flight) - flightSortIndex(b.flight)
      if (byFlight !== 0) return byFlight
      return a.name.localeCompare(b.name)
    })
    return filterMembers(sorted, query, group)
  }, [members, query, group])

  function submit() {
    if (!name.trim() || !flight) return
    add.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        flight,
      },
      {
        onSuccess: () => {
          setName('')
          setPhone('')
          setCity('')
          setFlight('')
        },
      },
    )
  }

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4">
        <h3 className="text-xl font-semibold text-ink">Add a member</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <SelectField
            label="Flight"
            value={flight}
            onChange={(e) => setFlight((e.target.value || '') as Flight | '')}
          >
            <option value="">Choose a flight</option>
            {FLIGHTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
          />
        </div>
        <Button onClick={submit} disabled={add.isPending || !name.trim() || !flight}>
          Save member
        </Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {FLIGHT_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setGroup(item.id)}
            className={cn(
              'min-h-12 rounded-md px-4 text-base font-semibold',
              group === item.id
                ? 'bg-forest text-white'
                : 'border border-input bg-white/70 text-ink hover:bg-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name, town, or flight"
          aria-label="Find a member"
          className={cn(
            'w-full min-h-16 rounded-lg border border-input bg-white/70 text-lg text-ink',
            'placeholder:text-ink-soft/70 focus:border-brand',
          )}
          style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft hover:bg-muted"
          >
            <X className="size-6" aria-hidden />
          </button>
        ) : null}
      </div>

      <p className="text-base text-ink-soft">
        {query.trim() || group !== 'all'
          ? visible.length === 1
            ? '1 matching member'
            : `${visible.length} matching members`
          : `${members.length} members on file.`}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-5 text-base text-ink-soft">
          {query.trim() || group !== 'all'
            ? 'No member matches that search.'
            : 'Nobody on the list yet. Add the first member above.'}
        </p>
      ) : (
        <div className="grid gap-3">
          {visible.map((member) => {
            const rounds = memberRounds(
              member.name,
              events,
              players,
              waitlist,
            )
            const phoneHref = telHref(member.phone)

            return (
              <Card key={member.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-ink">
                      {member.name}
                    </h3>
                    <p className="text-base font-medium text-brand">
                      {flightLabel(member.flight)}
                    </p>
                    <p className="text-base text-ink-soft">
                      {member.city ?? 'City not listed'}
                    </p>
                  </div>
                  {phoneHref && member.phone ? (
                    <a
                      href={phoneHref}
                      className="text-lg font-medium text-brand"
                    >
                      {formatPhone(member.phone)}
                    </a>
                  ) : (
                    <span className="text-base text-ink-soft">No phone</span>
                  )}
                </div>

                <div className="mt-4 max-w-sm">
                  <MemberFlightSelect member={member} />
                </div>

                {rounds.length === 0 ? (
                  <p className="mt-3 text-base text-ink-soft">
                    Not on a tournament yet.
                  </p>
                ) : (
                  <ul className="mt-3 grid gap-1.5">
                    {rounds.map(({ event, onStandby }) => (
                      <li key={event.id} className="text-base text-ink">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-ink-soft">
                          {' '}
                          · {formatDate(event.eventDate)}
                          {onStandby
                            ? ' · standby'
                            : isPast(event.eventDate)
                              ? ' · played'
                              : ' · on the field'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MemberFlightSelect({ member }: { member: Member }) {
  const patch = usePatchMember()

  return (
    <SelectField
      label="Flight"
      value={member.flight ?? ''}
      onChange={(e) =>
        patch.mutate({
          id: member.id,
          patch: { flight: (e.target.value || null) as Flight | null },
        })
      }
    >
      <option value="">No flight yet</option>
      {FLIGHTS.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </SelectField>
  )
}
