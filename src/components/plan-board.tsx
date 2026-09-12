import type { ReactNode } from 'react'
import { Bell, CalendarClock, FileSpreadsheet } from 'lucide-react'
import type { EventRecord } from '@/types'
import { Card } from '@/components/ui/card'
import { isAlertDue, isHeadcountDue, describeWhen, formatDate } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { SeasonPlanner } from '@/components/season-planner'
import { tournamentTrends, upcomingTournaments } from '@/lib/trends'

export function PlanBoard({
  events,
  onOpenTournament,
}: {
  events: EventRecord[]
  onOpenTournament: (id: string) => void
}) {
  const trends = tournamentTrends(events)
  const upcoming = upcomingTournaments(events)
  const holdNeeded = upcoming.filter(
    (e) => e.status === 'reaching_out' || !e.headcount,
  )
  const sheetsNeeded = upcoming.filter((e) => e.headcount && !e.teeSheetSentAt)
  const alertsNeeded = upcoming.filter(
    (e) => isAlertDue(e.eventDate) && !e.alertSentAt,
  )
  const headcountsNeeded = upcoming.filter(
    (e) => isHeadcountDue(e.eventDate) && !e.headcountSentAt,
  )

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
          VGA Idaho
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-ink">
          Hold the date. Build the sheet. Alert the field.
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Start from last year’s season, hold the same weeks, then get each
          round to the first tee. Rates and contacts live with the course.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TrendStat
          label={`${trends.year} tournaments`}
          value={String(trends.yearCount)}
          detail={`${trends.completedCount} already played`}
        />
        <TrendStat
          label="Average rate paid"
          value={formatMoney(trends.avgRate)}
          detail="From completed rounds this year"
        />
        <TrendStat
          label="Courses used"
          value={String(trends.coursesUsed)}
          detail="Idaho venues on the books"
        />
        <TrendStat
          label="Next up"
          value={trends.next ? describeWhen(trends.next.eventDate) : 'None held'}
          detail={
            trends.next
              ? `${trends.next.name} · ${trends.next.courseName}`
              : 'Hold a date from Courses'
          }
        />
      </div>

      <SeasonPlanner events={events} onOpenTournament={onOpenTournament} />

      <div className="grid gap-4">
        <h3 className="text-2xl font-semibold text-ink">Needs you this week</h3>
        {holdNeeded.length === 0 &&
        sheetsNeeded.length === 0 &&
        alertsNeeded.length === 0 &&
        headcountsNeeded.length === 0 ? (
          <Card>
            <p className="text-base text-ink-soft">
              Nothing waiting. Coming tournaments have a date, a tee sheet, and
              alerts set.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {holdNeeded.map((event) => (
              <ActionRow
                key={`hold-${event.id}`}
                icon={<CalendarClock className="size-6" />}
                title={`Hold tee times for ${event.name}`}
                detail={`${event.courseName} · ${formatDate(event.eventDate)}. Call the course and write down the block.`}
                onClick={() => onOpenTournament(event.id)}
              />
            ))}
            {headcountsNeeded.map((event) => (
              <ActionRow
                key={`hc-${event.id}`}
                icon={<CalendarClock className="size-6" />}
                title={`Give ${event.courseName} a headcount`}
                detail={`${event.name} · ${event.headcount ?? '—'} players, one week out.`}
                onClick={() => onOpenTournament(event.id)}
              />
            ))}
            {sheetsNeeded.map((event) => (
              <ActionRow
                key={`sheet-${event.id}`}
                icon={<FileSpreadsheet className="size-6" />}
                title={`Build the tee sheet for ${event.name}`}
                detail={`${event.courseName} · ${event.groupsHeld ?? '—'} foursomes from ${event.firstTeeTime ?? 'the first tee'}.`}
                onClick={() => onOpenTournament(event.id)}
              />
            ))}
            {alertsNeeded.map((event) => (
              <ActionRow
                key={`alert-${event.id}`}
                icon={<Bell className="size-6" />}
                title={`Turn on player texts for ${event.name}`}
                detail="Opted-in players get a reminder 3–5 days before the round."
                onClick={() => onOpenTournament(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <h3 className="text-2xl font-semibold text-ink">Coming up</h3>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-base text-ink-soft">
              No future dates on the book. Open Courses and hold one.
            </p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {upcoming.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onOpenTournament(event.id)}
                className="flex min-h-16 w-full items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4 text-left hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold text-ink">
                    {event.name}
                  </span>
                  <span className="block truncate text-base text-ink-soft">
                    {event.courseName}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-base font-semibold text-ink">
                    {formatDate(event.eventDate)}
                  </span>
                  <span className="block text-sm text-ink-soft">
                    {describeWhen(event.eventDate)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TrendStat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{detail}</p>
    </Card>
  )
}

function ActionRow({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-lg border border-brand/30 bg-brand-soft px-5 py-4 text-left hover:bg-white"
    >
      <span className="mt-0.5 text-brand" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-base text-ink-soft">{detail}</span>
      </span>
    </button>
  )
}
