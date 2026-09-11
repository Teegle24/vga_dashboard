import type { EventRecord } from '@/types'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import { formatMoney } from '@/lib/format'

export function HistoryList({ events }: { events: EventRecord[] }) {
  const past = events
    .filter((event) => event.status === 'complete')
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))

  if (past.length === 0) {
    return (
      <Card>
        <p className="text-base text-ink-soft">
          No completed rounds yet. After a tournament is played, it shows up
          here with the rate you paid.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-3">
      {past.map((event) => (
        <Card key={event.id} className="p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {formatDate(event.eventDate)}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-ink">{event.name}</h3>
          <p className="text-base text-ink-soft">{event.courseName}</p>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-base">
            <span>
              <span className="text-ink-soft">Players: </span>
              {event.headcount ?? event.playerCount}
            </span>
            <span>
              <span className="text-ink-soft">Rate paid: </span>
              {formatMoney(event.ratePaid)}
            </span>
            {event.groupsHeld ? (
              <span>
                <span className="text-ink-soft">Foursomes: </span>
                {event.groupsHeld}
              </span>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
