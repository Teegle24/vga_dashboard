import { useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { useDashboard } from '@/api/hooks'
import { ContactCard } from '@/components/contact-card'
import { CourseDirectory } from '@/components/course-directory'
import { CourseSearch } from '@/components/course-search'
import { QuickEventForm } from '@/components/quick-event-form'
import { SampleDataBanner } from '@/components/sample-data-banner'
import { TournamentList } from '@/components/tournament-list'
import { Footer } from '@/components/layout/footer'
import { TopBar } from '@/components/layout/top-bar'
import { Card, Pill, SectionHeading } from '@/components/ui/card'
import { isHeadcountDue } from '@/lib/dates'
import { currentStateName } from '@/lib/state'

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const selected = useMemo(
    () => data?.courses.find((c) => c.id === selectedId) ?? null,
    [data?.courses, selectedId],
  )

  const dueSoon = useMemo(
    () =>
      (data?.events ?? []).filter(
        (e) => isHeadcountDue(e.eventDate) && !e.headcountSentAt,
      ),
    [data?.events],
  )

  return (
    <div className="min-h-dvh bg-canvas">
      <TopBar />

      <main className="mx-auto grid max-w-[960px] gap-12 px-5 py-8">
        {error ? (
          <Card>
            <p className="text-base text-danger">
              {error instanceof Error
                ? error.message
                : 'Something went wrong loading courses.'}
            </p>
          </Card>
        ) : null}

        {data?.hasSampleData ? <SampleDataBanner /> : null}

        {/* Needs attention first — matches giving courses a headcount a week out. */}
        {dueSoon.length > 0 ? (
          <section>
            <div className="flex items-start gap-3 rounded-lg border border-accent bg-white px-5 py-5">
              <CalendarClock className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden />
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  Give these courses a headcount this week
                </h2>
                <ul className="mt-2 grid gap-1">
                  {dueSoon.map((event) => (
                    <li key={event.id} className="text-base text-ink">
                      {event.courseName} — {event.name}
                      {event.headcount ? ` · ${event.headcount} players` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {/* Action 1: look up a course contact. */}
        <section>
          <SectionHeading
            title="Find a course contact"
            description="Type a course or town, then tap it to see who to call."
          />
          <CourseSearch
            courses={data?.courses ?? []}
            query={query}
            onQueryChange={(value) => {
              setQuery(value)
              if (!value) setSelectedId(null)
            }}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selected ? (
            <div className="mt-4 grid gap-6">
              <Card>
                <ContactCard course={selected} />
              </Card>

              {/* Action 2: log a rate, right where the course already is. */}
              <Card>
                <SectionHeading title="Log an event here" />
                <QuickEventForm course={selected} />
              </Card>
            </div>
          ) : null}

          {isLoading ? (
            <p className="mt-4 text-base text-ink-soft">Loading courses…</p>
          ) : null}
        </section>

        {/* Upcoming tournaments */}
        <section>
          <SectionHeading
            title="Coming up"
            description="Tournaments and events ahead, soonest first."
            action={
              dueSoon.length > 0 ? (
                <Pill tone="due">
                  {dueSoon.length === 1
                    ? '1 course needs a headcount'
                    : `${dueSoon.length} courses need a headcount`}
                </Pill>
              ) : undefined
            }
          />
          <TournamentList events={data?.events ?? []} />
        </section>

        {/* Full directory */}
        <section>
          <SectionHeading
            title={`All ${currentStateName()} courses`}
            description={`${data?.courses.length ?? 0} courses. Tap one to see the contact, rates, and past events.`}
          />
          <CourseDirectory
            courses={data?.courses ?? []}
            events={data?.events ?? []}
            expandedId={expandedId}
            onExpand={setExpandedId}
          />
        </section>
      </main>

      <Footer data={data} />
    </div>
  )
}
