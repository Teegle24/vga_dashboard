import { useState } from 'react'
import { CalendarPlus, Check } from 'lucide-react'
import type { EventRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TextField } from '@/components/ui/field'
import { useLogEvent } from '@/data/hooks'
import {
  formatDate,
  formatMonthDay,
  todayInIdaho,
} from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { seasonSlots, type SeasonSlot } from '@/lib/season'

export function SeasonPlanner({
  events,
  onOpenTournament,
}: {
  events: EventRecord[]
  onOpenTournament: (id: string) => void
}) {
  const slots = seasonSlots(events)
  const open = slots.filter((slot) => !slot.booked).length

  return (
    <div className="grid gap-4">
      <div>
        <h3 className="text-2xl font-semibold text-ink">Next season</h3>
        <p className="mt-1.5 max-w-2xl text-base text-ink-soft">
          Last year’s rounds, in calendar order. Hold the same week at the same
          course. Change the date if they need a different day.
        </p>
      </div>

      {slots.length === 0 ? (
        <Card>
          <p className="text-base text-ink-soft">
            After a tournament is played, it shows up here so you can hold it
            again next year.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {open > 0 ? (
            <p className="text-base text-ink-soft">
              {open === 1
                ? '1 date still needs a hold.'
                : `${open} dates still need a hold.`}
            </p>
          ) : (
            <p className="text-base text-ink-soft">
              Every date from last year is on the book.
            </p>
          )}
          {slots.map((slot) => (
            <SeasonRow
              key={slot.key}
              slot={slot}
              onOpenTournament={onOpenTournament}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SeasonRow({
  slot,
  onOpenTournament,
}: {
  slot: SeasonSlot
  onOpenTournament: (id: string) => void
}) {
  const hold = useLogEvent()
  const [date, setDate] = useState(slot.suggestedDate)
  const today = todayInIdaho()
  const ready = date >= today

  function submit() {
    if (!ready) return
    hold.mutate({
      courseId: slot.courseId,
      name: slot.name,
      eventDate: date,
      headcount: slot.lastHeadcount,
      rateQuoted: slot.lastRate,
      firstTeeTime: slot.firstTeeTime,
      groupsHeld: slot.groupsHeld,
    })
  }

  if (slot.booked) {
    return (
      <button
        type="button"
        onClick={() => onOpenTournament(slot.booked!.id)}
        className="grid w-full gap-1 rounded-lg border border-border bg-card px-5 py-4 text-left backdrop-blur-md hover:bg-white/30"
      >
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-semibold text-ink">{slot.name}</span>
          <span className="inline-flex items-center gap-1.5 text-base font-medium text-brand">
            <Check className="size-5" aria-hidden />
            On the book
          </span>
        </span>
        <span className="text-base text-ink-soft">
          {slot.booked.courseName} · {formatDate(slot.booked.eventDate)}
        </span>
      </button>
    )
  }

  return (
    <Card className="grid gap-4 p-5">
      <div>
        <h4 className="text-xl font-semibold text-ink">{slot.name}</h4>
        <p className="mt-1 text-base text-ink-soft">
          Last year {formatMonthDay(slot.lastPlayed)} at {slot.courseName}
          {slot.lastHeadcount != null ? ` · ${slot.lastHeadcount} players` : ''}
          {slot.lastRate != null ? ` · ${formatMoney(slot.lastRate)}` : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <TextField
          label="Date to hold"
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button onClick={submit} disabled={!ready || hold.isPending}>
          <CalendarPlus className="size-5" aria-hidden />
          {hold.isPending ? 'Saving…' : 'Hold this again'}
        </Button>
      </div>
    </Card>
  )
}
