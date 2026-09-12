import { useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useAllPlayers, useAllWaitlist, useDashboard } from '@/data/hooks'
import { CourseDirectory } from '@/components/course-directory'
import { CourseSearch, filterCourses } from '@/components/course-search'
import { HistoryList } from '@/components/history-list'
import { MembersDirectory } from '@/components/members-directory'
import { PlanBoard } from '@/components/plan-board'
import { SampleDataBanner } from '@/components/sample-data-banner'
import { TournamentList } from '@/components/tournament-list'
import { Footer } from '@/components/layout/footer'
import {
  Sidebar,
  type DashboardTab,
} from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card, SectionHeading } from '@/components/ui/card'
import { isAlertDue, isHeadcountDue, isPast } from '@/lib/dates'

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const { data: players = [] } = useAllPlayers()
  const { data: waitlist = [] } = useAllWaitlist()
  const [tab, setTab] = useState<DashboardTab>('plan')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [openTournamentId, setOpenTournamentId] = useState<string | null>(null)
  const [scheduleHint, setScheduleHint] = useState(false)

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

  function goToSchedule() {
    setScheduleHint(true)
    openTab('courses')
  }

  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar value={tab} onChange={openTab} noticeCount={noticeCount} />

      <div className="min-w-0 flex-1">
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

          {tab === 'tournaments' ? (
            <section>
              <SectionHeading
                title="Tournaments"
                description="Hold the times, build the tee sheet, then alert the field 3–5 days out. Pick the course first — that is where you schedule."
                action={
                  <Button onClick={goToSchedule}>
                    <CalendarPlus className="size-5" aria-hidden />
                    Hold a new date
                  </Button>
                }
              />
              <TournamentList
                events={data?.events ?? []}
                openId={openTournamentId}
                onHoldNewDate={goToSchedule}
              />
            </section>
          ) : null}

          {tab === 'courses' ? (
            <section>
              <SectionHeading
                title="Course directory"
                description="Who to call, what they charged last time, and where you schedule the next tournament."
              />
              {scheduleHint ? (
                <Card className="mb-5">
                  <p className="text-xl font-semibold text-ink">
                    Schedule a tournament here
                  </p>
                  <p className="mt-2 text-base text-ink-soft">
                    Open a course, call the contact, then use the form inside
                    to hold the date. It will show up under Tournaments.
                  </p>
                </Card>
              ) : null}
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
                      : `${visibleCourses.length} Idaho courses. Open one to schedule a tournament or see the contact.`}
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
                      onExpand={(id) => {
                        setExpandedId(id)
                        if (id) setScheduleHint(false)
                      }}
                    />
                  )}
                </div>
              )}
            </section>
          ) : null}

          {tab === 'members' ? (
            <section>
              <SectionHeading
                title="Members"
                description="Who plays in which flight, and who is already on a tournament or waiting on standby."
              />
              <MembersDirectory
                members={data?.members ?? []}
                events={data?.events ?? []}
                players={players}
                waitlist={waitlist}
              />
            </section>
          ) : null}

          {tab === 'history' ? (
            <section>
              <SectionHeading
                title="History"
                description="Rounds already played, and the rate VGA paid."
              />
              <HistoryList events={data?.events ?? []} />
            </section>
          ) : null}
        </main>

        <Footer data={data} />
      </div>
    </div>
  )
}
