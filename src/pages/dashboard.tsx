import { useMemo, useState } from 'react'
import { useDashboard } from '@/data/hooks'
import { CourseDirectory } from '@/components/course-directory'
import { CourseSearch, filterCourses } from '@/components/course-search'
import { PlanBoard } from '@/components/plan-board'
import { SampleDataBanner } from '@/components/sample-data-banner'
import { TournamentList } from '@/components/tournament-list'
import { Footer } from '@/components/layout/footer'
import { TabBar, type DashboardTab } from '@/components/layout/tab-bar'
import { TopBar } from '@/components/layout/top-bar'
import { Card, SectionHeading } from '@/components/ui/card'
import { isAlertDue, isHeadcountDue, isPast } from '@/lib/dates'

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const [tab, setTab] = useState<DashboardTab>('plan')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [openTournamentId, setOpenTournamentId] = useState<string | null>(null)

  const noticeCount = useMemo(() => {
    const upcoming = (data?.events ?? []).filter((e) => !isPast(e.eventDate))
    return upcoming.filter(
      (e) =>
        e.status === 'reaching_out' ||
        !e.headcount ||
        (e.headcount && !e.teeSheetSentAt) ||
        (isHeadcountDue(e.eventDate) && !e.headcountSentAt) ||
        (isAlertDue(e.eventDate) && !e.alertSentAt),
    ).length
  }, [data?.events])

  const visibleCourses = useMemo(
    () => filterCourses(data?.courses ?? [], query),
    [data?.courses, query],
  )

  function openTab(next: DashboardTab) {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openTournament(id: string) {
    setOpenTournamentId(id)
    openTab('tournaments')
  }

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-30">
        <TopBar />
        <TabBar value={tab} onChange={openTab} noticeCount={noticeCount} />
      </div>

      <main className="mx-auto grid max-w-[960px] gap-8 px-5 py-9">
        {error ? (
          <Card>
            <p className="text-base text-danger">
              {error instanceof Error
                ? error.message
                : 'Something went wrong loading the desk.'}
            </p>
          </Card>
        ) : null}

        {data?.hasSampleData ? <SampleDataBanner /> : null}

        {tab === 'plan' ? (
          <PlanBoard
            events={data?.events ?? []}
            onOpenTournament={openTournament}
          />
        ) : null}

        {tab === 'courses' ? (
          <section>
            <SectionHeading
              title="Course directory"
              description="Who to call, what they charged last time, and a place to hold the next date."
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
                    : `${visibleCourses.length} Idaho courses. Tap one to open the contact.`}
                </p>
                {visibleCourses.length === 0 ? (
                  <p className="rounded-lg border border-border bg-card px-4 py-5 text-base text-ink-soft">
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
        ) : null}

        {tab === 'tournaments' ? (
          <section>
            <SectionHeading
              title="Tournaments"
              description="Stroke play only. Hold the times, build the tee sheet, then alert the field 3–5 days out."
            />
            <TournamentList
              events={data?.events ?? []}
              openId={openTournamentId}
            />
          </section>
        ) : null}
      </main>

      <Footer data={data} />
    </div>
  )
}
