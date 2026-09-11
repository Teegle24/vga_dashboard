import { Download } from 'lucide-react'
import type { DashboardData } from '@shared/types'
import { Button } from '@/components/ui/button'
import { FeedbackButton } from '@/components/feedback-button'
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
    ['Event', 'Course', 'Date', 'Players', 'Rate paid', 'Tournament'],
    ...data.events.map((e) => [
      e.name,
      e.courseName,
      e.eventDate,
      e.headcount?.toString() ?? '',
      e.ratePaid?.toString() ?? '',
      e.isTournament ? 'Yes' : 'No',
    ]),
  ]
  downloadCsv('vga-idaho-events.csv', eventRows)
}

export function Footer({ data }: { data?: DashboardData }) {
  return (
    <footer className="mt-14 border-t border-border bg-white">
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
        </div>

        <p className="text-sm text-ink-soft">
          Teegle Golf · Built for the Veteran Golfers Association, Idaho
        </p>
      </div>
    </footer>
  )
}
