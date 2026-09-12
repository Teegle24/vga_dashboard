import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, RotateCcw } from 'lucide-react'
import type { DashboardData } from '@/types'
import { Button } from '@/components/ui/button'
import { FeedbackButton } from '@/components/feedback-button'
import { resetDemoData } from '@/data/store'
import { flightLabel } from '@/lib/flights'
import { downloadCsv } from '@/lib/tee-sheet'

function exportEverything(data: DashboardData) {
  const courseRows = [
    [
      'Course',
      'Address',
      'City',
      'State',
      'Zip',
      'Course phone',
      'Website',
      'Contact name',
      'Contact email',
      'Contact phone',
      'Last confirmed',
      'Notes',
      'List rate',
      'Last rate paid',
      'Last booked',
    ],
    ...data.courses.map((c) => [
      c.name,
      c.address ?? '',
      c.city ?? '',
      c.stateCode,
      c.zip ?? '',
      c.phone ?? '',
      c.website ?? '',
      c.contact.contactName ?? '',
      c.contact.email ?? '',
      c.contact.phone ?? '',
      c.contact.lastConfirmedDate ?? '',
      c.contact.notes ?? '',
      c.listRate?.toString() ?? '',
      c.lastNegotiatedRate?.toString() ?? '',
      c.lastEventDate ?? '',
    ]),
  ]
  downloadCsv('vga-idaho-courses.csv', courseRows)

  const eventRows = [
    ['Tournament', 'Course', 'Date', 'Status', 'Players', 'Rate paid'],
    ...data.events.map((e) => [
      e.name,
      e.courseName,
      e.eventDate,
      e.status,
      e.headcount?.toString() ?? '',
      e.ratePaid?.toString() ?? '',
    ]),
  ]
  downloadCsv('vga-idaho-tournaments.csv', eventRows)

  const memberRows = [
    ['Name', 'Flight', 'Phone', 'City'],
    ...data.members.map((m) => [
      m.name,
      m.flight ? flightLabel(m.flight) : '',
      m.phone ?? '',
      m.city ?? '',
    ]),
  ]
  downloadCsv('vga-idaho-members.csv', memberRows)
}

/**
 * Edits stick in the browser, so a walkthrough needs a way back to a clean
 * slate. Two taps instead of a confirm dialog, same as everything else here.
 */
function StartOver() {
  const [confirming, setConfirming] = useState(false)
  const client = useQueryClient()

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        <RotateCcw className="size-5" aria-hidden />
        Start over
      </Button>
    )
  }

  return (
    <div className="grid w-full gap-3 rounded-lg border border-border bg-muted p-4">
      <p className="text-base text-ink">
        This erases everything typed in so far and puts the sample data back.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="danger"
          onClick={() => {
            resetDemoData()
            client.invalidateQueries()
            setConfirming(false)
          }}
        >
          Yes, start over
        </Button>
        <Button variant="secondary" onClick={() => setConfirming(false)}>
          Keep my changes
        </Button>
      </div>
    </div>
  )
}

export function Footer({ data }: { data?: DashboardData }) {
  return (
    <footer className="mt-14 border-t border-white/10 bg-forest/72 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-5 py-8">
        <div className="flex flex-wrap gap-3">
          <FeedbackButton />
          <Button
            variant="secondary"
            onClick={() => data && exportEverything(data)}
            disabled={!data}
          >
            <Download className="size-5" aria-hidden />
            Download everything
          </Button>
          <StartOver />
        </div>

        <p className="text-sm text-white/60">
          Teegle Golf · Veteran Golfers Association, Idaho
        </p>
      </div>
    </footer>
  )
}
