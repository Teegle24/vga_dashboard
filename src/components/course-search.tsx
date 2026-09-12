import { Search, X } from 'lucide-react'
import type { Course } from '@/types'
import { cn } from '@/lib/utils'

/** Empty query returns every course so the directory can stay on one list. */
export function filterCourses(courses: Course[], query: string): Course[] {
  const q = query.trim().toLowerCase()
  if (!q) return courses
  return courses.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.city ?? '').toLowerCase().includes(q) ||
      (c.contact.contactName ?? '').toLowerCase().includes(q),
  )
}

export function CourseSearch({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
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
          'w-full min-h-16 rounded-lg border border-input bg-white/35 text-lg text-ink backdrop-blur-sm',
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
  )
}
