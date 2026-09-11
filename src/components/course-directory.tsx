import { useState } from 'react'
import { ChevronDown, Trash2, Undo2 } from 'lucide-react'
import type { Course, EventRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ContactCard } from '@/components/contact-card'
import { HoldDateForm } from '@/components/hold-date-form'
import { useDeleteEvent, useRestoreEvent } from '@/data/hooks'
import { formatDate, isPast } from '@/lib/dates'
import { formatMoney, formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Past events for one course, newest first. This is the rate history. */
function EventHistory({
  events,
  onDeleted,
}: {
  events: EventRecord[]
  onDeleted: (event: EventRecord) => void
}) {
  const remove = useDeleteEvent()
  const past = events
    .filter((e) => isPast(e.eventDate))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
    .slice(0, 5)

  if (past.length === 0) {
    return (
      <p className="text-base text-ink-soft">
        No tournaments logged here yet. Hold a date above and the rate history fills in.
      </p>
    )
  }

  return (
    <ul className="grid gap-2">
      {past.map((event) => (
        <li
          key={event.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white px-3 py-3"
        >
          <span className="min-w-0">
            <span className="block text-base font-medium text-ink">
              {event.name}
            </span>
            <span className="block text-base text-ink-soft">
              {formatDate(event.eventDate)}
              {event.headcount ? ` · ${event.headcount} players` : ''}
            </span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-lg font-semibold text-ink">
              {formatMoney(event.ratePaid)}
            </span>
            <button
              type="button"
              aria-label={`Delete ${event.name}`}
              onClick={() => {
                remove.mutate(event.id)
                onDeleted(event)
              }}
              className="flex size-12 items-center justify-center rounded-md text-ink-soft hover:bg-muted"
            >
              <Trash2 className="size-5" aria-hidden />
            </button>
          </span>
        </li>
      ))}
    </ul>
  )
}

function CourseRow({
  course,
  events,
  expanded,
  onToggle,
}: {
  course: Course
  events: EventRecord[]
  expanded: boolean
  onToggle: () => void
}) {
  const [justDeleted, setJustDeleted] = useState<EventRecord | null>(null)
  const restore = useRestoreEvent()

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-muted"
      >
        <span className="min-w-0">
          <span className="block truncate text-xl font-semibold text-ink">
            {course.name}
          </span>
          <span className="block truncate text-base text-ink-soft">
            {course.city}
            {course.contact.contactName
              ? ` · ${course.contact.contactName} · ${formatPhone(course.contact.phone)}`
              : ' · no contact yet'}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-4">
          <span className="hidden text-right sm:block">
            <span className="block text-sm text-ink-soft">Last rate paid</span>
            <span className="block text-lg font-semibold text-ink">
              {formatMoney(course.lastNegotiatedRate)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'size-6 shrink-0 text-ink-soft transition-transform',
              expanded && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-6 border-t border-border px-5 py-6">
          <ContactCard course={course} />

          <div className="grid gap-4 rounded-lg border border-border bg-white/35 p-4">
            <h4 className="text-lg font-semibold text-ink">Hold a date here</h4>
            <HoldDateForm course={course} />
          </div>

          <div className="grid gap-3">
            <h4 className="text-lg font-semibold text-ink">Played here</h4>
            {justDeleted ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent bg-accent-soft px-4 py-3">
                <span className="text-base text-ink">
                  Deleted “{justDeleted.name}”.
                </span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    restore.mutate(justDeleted)
                    setJustDeleted(null)
                  }}
                >
                  <Undo2 className="size-5" aria-hidden />
                  Undo
                </Button>
              </div>
            ) : null}
            <EventHistory events={events} onDeleted={setJustDeleted} />
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export function CourseDirectory({
  courses,
  events,
  expandedId,
  onExpand,
}: {
  courses: Course[]
  events: EventRecord[]
  expandedId: string | null
  onExpand: (id: string | null) => void
}) {
  return (
    <div className="grid gap-3">
      {courses.map((course) => (
        <CourseRow
          key={course.id}
          course={course}
          events={events.filter((e) => e.courseId === course.id)}
          expanded={expandedId === course.id}
          onToggle={() => onExpand(expandedId === course.id ? null : course.id)}
        />
      ))}
    </div>
  )
}
