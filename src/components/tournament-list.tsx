import { useState } from 'react'
import { Bell, Check, ChevronDown, FileSpreadsheet, Users } from 'lucide-react'
import type { EventRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, Pill } from '@/components/ui/card'
import { FieldPanel } from '@/components/field-panel'
import { TeeSheetBuilder } from '@/components/tee-sheet-builder'
import { WaitlistPanel } from '@/components/waitlist-panel'
import { usePatchEvent } from '@/data/hooks'
import {
  describeWhen,
  formatDate,
  isAlertDue,
  isHeadcountDue,
  isPast,
} from '@/lib/dates'
import { formatMoney, statusLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

function TournamentStatus({ event }: { event: EventRecord }) {
  if (isAlertDue(event.eventDate) && event.alertsOn && !event.alertSentAt) {
    return <Pill tone="due">Text the field this week</Pill>
  }
  if (isHeadcountDue(event.eventDate) && !event.headcountSentAt) {
    return <Pill tone="due">Give the course a headcount</Pill>
  }
  if (event.status === 'reaching_out') {
    return <Pill tone="due">{statusLabel(event.status)}</Pill>
  }
  if (event.teeSheetSentAt) {
    return <Pill tone="done">Tee sheet ready</Pill>
  }
  return <Pill>{statusLabel(event.status)}</Pill>
}

function TournamentCard({
  event,
  startOpen,
}: {
  event: EventRecord
  startOpen?: boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(startOpen))
  const [rosterOpen, setRosterOpen] = useState(false)
  const patch = usePatchEvent()
  const past = isPast(event.eventDate)
  const highlight =
    (isHeadcountDue(event.eventDate) && !event.headcountSentAt) ||
    (isAlertDue(event.eventDate) && !event.alertSentAt)

  return (
    <Card className={cn('p-0', highlight ? 'border-gold' : undefined)}>
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {describeWhen(event.eventDate)} · {formatDate(event.eventDate)}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-ink">{event.name}</h3>
            <p className="text-base text-ink-soft">{event.courseName}</p>
          </div>
          <TournamentStatus event={event} />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-base">
          <span>
            <span className="text-ink-soft">On the field: </span>
            {event.playerCount}
            {event.headcount != null ? ` of ${event.headcount}` : ''}
          </span>
          {event.groupsHeld ? (
            <span>
              <span className="text-ink-soft">Foursomes held: </span>
              {event.groupsHeld}
            </span>
          ) : null}
          {event.firstTeeTime ? (
            <span>
              <span className="text-ink-soft">First tee: </span>
              {event.firstTeeTime}
            </span>
          ) : null}
          <span>
            <span className="text-ink-soft">
              {event.ratePaid != null ? 'Rate paid: ' : 'Rate quoted: '}
            </span>
            {formatMoney(event.ratePaid ?? event.rateQuoted)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-ink-soft" aria-hidden />
            {event.waitlistCount} on standby
          </span>
        </div>

        {!past ? (
          <div className="flex flex-wrap gap-3">
            {!event.headcountSentAt ? (
              <Button
                onClick={() =>
                  patch.mutate({
                    id: event.id,
                    patch: { headcountSentAt: new Date().toISOString() },
                  })
                }
                disabled={patch.isPending}
              >
                <Check className="size-5" aria-hidden />
                Mark headcount sent
              </Button>
            ) : null}

            <Button
              variant="secondary"
              onClick={() => setSheetOpen((v) => !v)}
            >
              <FileSpreadsheet className="size-5" aria-hidden />
              {sheetOpen ? 'Hide tee sheet' : 'Build tee sheet'}
            </Button>

            <Button
              variant={event.alertsOn ? 'quiet' : 'secondary'}
              onClick={() =>
                patch.mutate({
                  id: event.id,
                  patch: {
                    alertsOn: !event.alertsOn,
                    alertSentAt: event.alertsOn ? event.alertSentAt : null,
                  },
                })
              }
              disabled={patch.isPending}
            >
              <Bell className="size-5" aria-hidden />
              {event.alertsOn
                ? 'Player texts are on'
                : 'Text players 3–5 days out'}
            </Button>

            <Button variant="quiet" onClick={() => setRosterOpen((v) => !v)}>
              <ChevronDown
                className={cn(
                  'size-5 transition-transform',
                  rosterOpen && 'rotate-180',
                )}
                aria-hidden
              />
              {rosterOpen ? 'Hide players' : 'Field & standby'}
            </Button>
          </div>
        ) : null}

        {event.alertsOn && !past ? (
          <p className="text-base text-ink-soft">
            Players who opted in will get a text three to five days before this
            round. That list is separate from any course-alert subscription.
          </p>
        ) : null}
      </div>

      {sheetOpen ? (
        <div className="border-t border-border p-5">
          <h4 className="mb-3 text-lg font-semibold text-ink">Tee sheet</h4>
          <TeeSheetBuilder event={event} />
        </div>
      ) : null}

      {rosterOpen ? (
        <div className="grid gap-4 border-t border-border p-5 lg:grid-cols-2">
          <div className="min-w-0">
            <FieldPanel eventId={event.id} spotsHeld={event.headcount} />
          </div>
          <div className="min-w-0">
            <WaitlistPanel eventId={event.id} />
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export function TournamentList({
  events,
  openId,
}: {
  events: EventRecord[]
  openId?: string | null
}) {
  const upcoming = events
    .filter((e) => !isPast(e.eventDate))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))

  if (upcoming.length === 0) {
    return (
      <Card>
        <p className="text-base text-ink-soft">
          No dates held yet. Open Courses, call the contact, and hold a date
          there.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {upcoming.map((event) => (
        <TournamentCard
          key={event.id}
          event={event}
          startOpen={openId === event.id}
        />
      ))}
    </div>
  )
}
