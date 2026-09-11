import { useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { useDashboard } from '@/data/hooks'
import { CourseDirectory } from '@/components/course-directory'
import { CourseSearch, filterCourses } from '@/components/course-search'
import { SampleDataBanner } from '@/components/sample-data-banner'
import { TournamentList } from '@/components/tournament-list'
import { Footer } from '@/components/layout/footer'
import { TabBar, type DashboardTab } from '@/components/layout/tab-bar'
import { TopBar } from '@/components/layout/top-bar'
import { Card, SectionHeading } from '@/components/ui/card'
import { isHeadcountDue } from '@/lib/dates'

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const [tab, setTab] = useState<DashboardTab>('courses')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const dueSoon = useMemo(
    () =>
      (data?.events ?? []).filter(
        (e) => isHeadcountDue(e.eventDate) && !e.headcountSentAt,
      ),
    [data?.events],
  )

  const visibleCourses = useMemo(
    () => filterCourses(data?.courses ?? [], query),
    [data?.courses, query],
  )

  function openTab(next: DashboardTab) {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="sticky top-0 z-30">
        <TopBar />
        <TabBar
          value={tab}
          onChange={openTab}
          comingUpBadge={dueSoon.length}
        />
      </div>

      <main className="mx-auto grid max-w-[960px] gap-8 px-5 py-8">
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

        {tab === 'courses' ? (
          <section>
            <SectionHeading
              title="Find a course"
              description="Type a course or town, then tap it to see who to call and log a rate."
            />
            <CourseSearch
              query={query}
              onQueryChange={(value) => {
                setQuery(value)
                setExpandedId(null)
              }}
            />

            {isLoading ? (
              <p className="mt-4 text-base text-ink-soft">Loading courses…</p>
            ) : (
              <div className="mt-5 grid gap-3">
                <p className="text-base text-ink-soft">
                  {query.trim()
                    ? visibleCourses.length === 1
                      ? '1 matching course'
                      : `${visibleCourses.length} matching courses`
                    : `${visibleCourses.length} courses. Tap one to open it.`}
                </p>
                {visibleCourses.length === 0 ? (
                  <p className="rounded-lg border border-border bg-white px-4 py-5 text-base text-ink-soft">
                    No course matches “{query}”. Try the town instead.
                  </p>
                ) : (
                  <CourseDirectory
                    courses={visibleCourses}
                    events={data?.events ?? []}
                    expandedId={expandedId}
                    onExpand={setExpandedId}
                  />
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-8">
            {dueSoon.length > 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-accent bg-white px-5 py-5">
                <CalendarClock
                  className="mt-0.5 size-6 shrink-0 text-accent"
                  aria-hidden
                />
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
            ) : null}

            <div>
              <SectionHeading
                title="Coming up"
                description="Tournaments and events ahead, soonest first."
              />
              <TournamentList events={data?.events ?? []} />
            </div>
          </section>
        )}
      </main>

      <Footer data={data} />
    </div>
  )
}
