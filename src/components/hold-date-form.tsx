import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import type { Course } from '@/types'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'
import { useLogEvent } from '@/data/hooks'
import { todayInIdaho } from '@/lib/dates'

/**
 * The job at a course: call the contact, then write down the date and the
 * block of tee times they held. Past dates still work so rate history can
 * be filled in from memory.
 */
export function HoldDateForm({
  course,
  onDone,
}: {
  course: Course
  onDone?: () => void
}) {
  const hold = useLogEvent()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState(todayInIdaho())
  const [headcount, setHeadcount] = useState('')
  const [groupsHeld, setGroupsHeld] = useState('')
  const [firstTeeTime, setFirstTeeTime] = useState('08:00')
  const [rateQuoted, setRateQuoted] = useState('')
  const [saved, setSaved] = useState(false)

  function submit() {
    const players = headcount ? Number(headcount) : null
    const groups = groupsHeld
      ? Number(groupsHeld)
      : players
        ? Math.ceil(players / 4)
        : null

    hold.mutate(
      {
        courseId: course.id,
        name: name.trim() || 'VGA Tournament',
        eventDate,
        headcount: players,
        rateQuoted: rateQuoted ? Number(rateQuoted) : null,
        firstTeeTime: firstTeeTime || null,
        groupsHeld: groups,
      },
      {
        onSuccess: () => {
          setName('')
          setHeadcount('')
          setGroupsHeld('')
          setRateQuoted('')
          setFirstTeeTime('08:00')
          setEventDate(todayInIdaho())
          setSaved(true)
          window.setTimeout(() => setSaved(false), 4000)
          onDone?.()
        },
      },
    )
  }

  const ready = Boolean(eventDate)

  return (
    <div className="grid gap-4">
      <p className="text-base text-ink-soft">
        Call {course.contact.contactName ?? 'the course'}, then record the date
        and tee times they will hold for the field.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date to hold"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <TextField
          label="Tournament name"
          hint="Optional — defaults to VGA Tournament"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Idaho State Championship"
        />
        <TextField
          label="Players to hold"
          type="number"
          inputMode="numeric"
          min={0}
          value={headcount}
          onChange={(e) => setHeadcount(e.target.value)}
          placeholder="48"
        />
        <TextField
          label="Foursomes held"
          type="number"
          inputMode="numeric"
          min={0}
          hint="Leave blank and we count from the player number"
          value={groupsHeld}
          onChange={(e) => setGroupsHeld(e.target.value)}
          placeholder="12"
        />
        <TextField
          label="First tee time"
          type="time"
          value={firstTeeTime}
          onChange={(e) => setFirstTeeTime(e.target.value)}
        />
        <TextField
          label="Rate quoted per player"
          type="number"
          inputMode="decimal"
          min={0}
          value={rateQuoted}
          onChange={(e) => setRateQuoted(e.target.value)}
          placeholder={course.listRate ? String(course.listRate) : '48'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={submit} disabled={!ready || hold.isPending}>
          <CalendarPlus className="size-5" aria-hidden />
          {hold.isPending ? 'Saving…' : 'Hold this date'}
        </Button>
        {saved ? (
          <span className="text-base font-medium text-brand">
            Saved. It will show under Tournaments.
          </span>
        ) : null}
      </div>
    </div>
  )
}
