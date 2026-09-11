import { Search, X } from 'lucide-react'
import type { Course } from '@/types'
import { cn } from '@/lib/utils'
import { formatPhone } from '@/lib/format'

export function matchCourses(courses: Course[], query: string): Course[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return courses
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city ?? '').toLowerCase().includes(q) ||
        (c.contact.contactName ?? '').toLowerCase().includes(q),
    )
    .slice(0, 8)
}

export function CourseSearch({
  courses,
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: {
  courses: Course[]
  query: string
  onQueryChange: (value: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const results = matchCourses(courses, query)
  const showResults = query.trim().length > 0

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Type a course or town"
          aria-label="Find a course"
          className={cn(
            'w-full min-h-16 rounded-lg border border-input bg-white pl-13 pr-13 text-lg text-ink',
            'placeholder:text-ink-soft/70 focus:border-brand',
          )}
          style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft hover:bg-muted"
          >
            <X className="size-6" aria-hidden />
          </button>
        ) : null}
      </div>

      {showResults ? (
        results.length ? (
          <ul className="grid gap-2">
            {results.map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => onSelect(course.id)}
                  className={cn(
                    'flex w-full min-h-16 items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-colors',
                    course.id === selectedId
                      ? 'border-brand bg-brand-soft'
                      : 'border-border bg-white hover:bg-muted',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-medium text-ink">
                      {course.name}
                    </span>
                    <span className="block truncate text-base text-ink-soft">
                      {course.city}
                      {course.contact.contactName
                        ? ` · ${course.contact.contactName}`
                        : ' · no contact yet'}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-base text-ink-soft sm:block">
                    {formatPhone(course.contact.phone ?? course.phone)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-border bg-white px-4 py-5 text-base text-ink-soft">
            No course matches “{query}”. Try the town instead.
          </p>
        )
      ) : null}
    </div>
  )
}
