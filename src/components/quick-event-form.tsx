import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Course } from '@/types'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'
import { useLogEvent } from '@/data/hooks'
import { todayInIdaho } from '@/lib/dates'

/**
 * The second of the two actions that must be fast: log what a course was
 * actually paid. Past dates are allowed on purpose — backdating a few
 * remembered events is how a director builds up real rate history.
 */
export function QuickEventForm({
  course,
  onDone,
}: {
  course: Course
  onDone?: () => void
}) {
  const logEvent = useLogEvent()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState(todayInIdaho())
  const [headcount, setHeadcount] = useState('')
  const [ratePaid, setRatePaid] = useState('')
  const [saved, setSaved] = useState(false)

  function submit() {
    logEvent.mutate(
      {
        courseId: course.id,
        name: name.trim() || 'VGA event',
        eventDate,
        headcount: headcount ? Number(headcount) : null,
        ratePaid: ratePaid ? Number(ratePaid) : null,
        isTournament: true,
      },
      {
        onSuccess: () => {
          setName('')
          setHeadcount('')
          setRatePaid('')
          setEventDate(todayInIdaho())
          setSaved(true)
          window.setTimeout(() => setSaved(false), 4000)
          onDone?.()
        },
      },
    )
  }

  const ready = eventDate && (headcount || ratePaid)

  return (
    <div className="grid gap-4">
      <p className="text-base text-ink-soft">
        Logging an event here updates the rate history for {course.name}. You can
        use a past date.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date of the event"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <TextField
          label="Event name"
          hint="Optional"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Fall Four-Ball"
        />
        <TextField
          label="People who played"
          type="number"
          inputMode="numeric"
          min={0}
          value={headcount}
          onChange={(e) => setHeadcount(e.target.value)}
          placeholder="48"
        />
        <TextField
          label="Rate paid per player"
          type="number"
          inputMode="decimal"
          min={0}
          value={ratePaid}
          onChange={(e) => setRatePaid(e.target.value)}
          placeholder="52"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          onClick={submit}
          disabled={!ready || logEvent.isPending}
        >
          <Plus className="size-5" aria-hidden />
          {logEvent.isPending ? 'Saving…' : 'Save this event'}
        </Button>
        {saved ? (
          <span className="text-base font-medium text-brand">
            Saved. Rate history updated.
          </span>
        ) : null}
      </div>
    </div>
  )
}
