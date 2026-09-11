import { useState } from 'react'
import { Check, ChevronDown, FileDown, Users } from 'lucide-react'
import type { EventRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, Pill } from '@/components/ui/card'
import { WaitlistPanel } from '@/components/waitlist-panel'
import { usePatchEvent } from '@/data/hooks'
import { describeWhen, formatDate, isHeadcountDue, isPast } from '@/lib/dates'
import { formatHeadcount, formatMoney } from '@/lib/format'
import { downloadTeeSheet } from '@/lib/tee-sheet'
import { cn } from '@/lib/utils'

function HeadcountStatus({ event }: { event: EventRecord }) {
  if (event.headcountSentAt) {
    return <Pill tone="done">Headcount sent</Pill>
  }
  if (isHeadcountDue(event.eventDate)) {
    return <Pill tone="due">Send headcount this week</Pill>
  }
  return <Pill>Headcount not sent yet</Pill>
}

function EventCard({ event }: { event: EventRecord }) {
  const [open, setOpen] = useState(false)
  const patch = usePatchEvent()
  const due = isHeadcountDue(event.eventDate) && !event.headcountSentAt

  return (
    <Card
      className={cn(
        'p-0',
        due ? 'border-accent' : undefined,
      )}
    >
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-wide text-ink-soft">
              {describeWhen(event.eventDate)} · {formatDate(event.eventDate)}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{event.name}</h3>
            <p className="text-base text-ink-soft">{event.courseName}</p>
          </div>
          <HeadcountStatus event={event} />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <span className="text-base text-ink">
            <span className="text-ink-soft">Players: </span>
            {formatHeadcount(event.headcount)}
          </span>
          <span className="text-base text-ink">
            <span className="text-ink-soft">Rate paid: </span>
            {formatMoney(event.ratePaid)}
          </span>
          {event.waitlistCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-base text-ink">
              <Users className="size-4 text-ink-soft" aria-hidden />
              {event.waitlistCount} on standby
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {!event.headcountSentAt && !isPast(event.eventDate) ? (
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

          <Button variant="secondary" onClick={() => downloadTeeSheet(event)}>
            <FileDown className="size-5" aria-hidden />
            Create tee sheet
          </Button>

          <Button variant="quiet" onClick={() => setOpen((v) => !v)}>
            <ChevronDown
              className={cn('size-5 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
            {open ? 'Hide standby list' : 'Standby list'}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border p-5">
          <WaitlistPanel eventId={event.id} />
        </div>
      ) : null}
    </Card>
  )
}

export function TournamentList({ events }: { events: EventRecord[] }) {
  const upcoming = events
    .filter((e) => !isPast(e.eventDate))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))

  if (upcoming.length === 0) {
    return (
      <Card>
        <p className="text-base text-ink-soft">
          No events coming up. Open Courses, tap a course, and log one there.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {upcoming.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
