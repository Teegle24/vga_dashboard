import { useEffect, useState } from 'react'
import { Check, Mail, MapPin, Phone, Globe, Pencil } from 'lucide-react'
import type { Course } from '@/types'
import { Button } from '@/components/ui/button'
import { Pill } from '@/components/ui/card'
import { TextAreaField, TextField } from '@/components/ui/field'
import { useSaveContact } from '@/data/hooks'
import { daysUntil, describeUpdated, formatDate } from '@/lib/dates'
import {
  displayUrl,
  formatMoney,
  formatPhone,
  telHref,
  websiteHref,
} from '@/lib/format'

/** A contact older than ~6 months is the stale-info problem Mark described. */
const STALE_AFTER_DAYS = 180

function isStale(lastConfirmed: string | null) {
  if (!lastConfirmed) return true
  return Math.abs(daysUntil(lastConfirmed)) > STALE_AFTER_DAYS
}

/** Full-width tappable row. On a phone this should end in an actual phone call. */
function LinkRow({
  href,
  icon,
  label,
  value,
}: {
  href: string | null
  icon: React.ReactNode
  label: string
  value: string
}) {
  const content = (
    <>
      <span className="mt-0.5 text-brand" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-ink-soft">{label}</span>
        <span className="block break-words text-lg font-medium text-ink">
          {value}
        </span>
      </span>
    </>
  )

  if (!href) {
    return <div className="flex gap-3 rounded-md px-3 py-3">{content}</div>
  }

  return (
    <a
      href={href}
      className="flex min-h-14 gap-3 rounded-md px-3 py-3 transition-colors hover:bg-brand-soft active:bg-brand-soft"
      {...(href.startsWith('http')
        ? { target: '_blank', rel: 'noreferrer' }
        : {})}
    >
      {content}
    </a>
  )
}

export function ContactCard({ course }: { course: Course }) {
  const save = useSaveContact()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    contactName: course.contact.contactName ?? '',
    email: course.contact.email ?? '',
    phone: course.contact.phone ?? '',
    notes: course.contact.notes ?? '',
  })

  // Reset the draft whenever a different course is shown.
  useEffect(() => {
    setEditing(false)
    setForm({
      contactName: course.contact.contactName ?? '',
      email: course.contact.email ?? '',
      phone: course.contact.phone ?? '',
      notes: course.contact.notes ?? '',
    })
  }, [course.id, course.contact])

  const stale = isStale(course.contact.lastConfirmedDate)
  const hasContact = Boolean(course.contact.contactName)
  const updatedAgo = describeUpdated(course.contact.updatedAt)

  function submit(confirmNow: boolean) {
    save.mutate({
      courseId: course.id,
      input: {
        contactName: form.contactName.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
        confirmNow,
      },
    })
    setEditing(false)
  }

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="text-2xl font-semibold text-ink">{course.name}</h3>
        <p className="mt-1 text-base text-ink-soft">
          {[course.address, course.city].filter(Boolean).join(', ')}
          {course.zip ? ` ${course.zip}` : ''}
        </p>
      </div>

      {/* Course Contact */}
      <div className="rounded-lg border border-border bg-muted p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-semibold text-ink">Course Contact</h4>
          {hasContact ? (
            stale ? (
              <Pill tone="due">Needs confirming</Pill>
            ) : (
              <Pill tone="done">
                Confirmed {formatDate(course.contact.lastConfirmedDate)}
              </Pill>
            )
          ) : (
            <Pill tone="due">No contact yet</Pill>
          )}
        </div>

        {editing ? (
          <div className="grid gap-4 pt-2">
            <TextField
              label="Contact name"
              value={form.contactName}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactName: e.target.value }))
              }
              placeholder="Who do you call at this course?"
            />
            <TextField
              label="Phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="208-555-0100"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@course.com"
            />
            <TextAreaField
              label="Notes"
              hint="Anything worth remembering next time you book here."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => submit(true)}>Save</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-1">
            {hasContact ? (
              <>
                <LinkRow
                  href={null}
                  icon={<Check className="size-5" />}
                  label="Name"
                  value={course.contact.contactName ?? '—'}
                />
                <LinkRow
                  href={telHref(course.contact.phone)}
                  icon={<Phone className="size-5" />}
                  label="Phone — tap to call"
                  value={formatPhone(course.contact.phone)}
                />
                {course.contact.email ? (
                  <LinkRow
                    href={`mailto:${course.contact.email}`}
                    icon={<Mail className="size-5" />}
                    label="Email — tap to write"
                    value={course.contact.email}
                  />
                ) : null}
                {course.contact.notes ? (
                  <p className="mt-2 rounded-md bg-white px-3 py-3 text-base leading-relaxed text-ink">
                    {course.contact.notes}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="px-3 py-3 text-base text-ink-soft">
                No one recorded yet. Add the person you call at this course.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="size-5" aria-hidden />
                {hasContact ? 'Edit contact' : 'Add contact'}
              </Button>
              {hasContact ? (
                <Button
                  variant="quiet"
                  onClick={() => submit(true)}
                  disabled={save.isPending}
                >
                  <Check className="size-5" aria-hidden />
                  This is still correct
                </Button>
              ) : null}
            </div>

            {updatedAgo && course.contact.updatedBy ? (
              <p className="mt-2 px-3 text-sm text-ink-soft">
                Updated by {course.contact.updatedBy} {updatedAgo}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Course line + website */}
      <div className="grid gap-1 sm:grid-cols-2">
        <LinkRow
          href={telHref(course.phone)}
          icon={<Phone className="size-5" />}
          label="Course main line"
          value={formatPhone(course.phone)}
        />
        <LinkRow
          href={websiteHref(course.website)}
          icon={<Globe className="size-5" />}
          label="Website"
          value={displayUrl(course.website)}
        />
        <LinkRow
          href={
            course.address
              ? `https://maps.google.com/?q=${encodeURIComponent(
                  `${course.name} ${course.address} ${course.city ?? ''}`,
                )}`
              : null
          }
          icon={<MapPin className="size-5" />}
          label="Directions"
          value={course.city ?? '—'}
        />
      </div>

      {/* Rates */}
      <div className="grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-soft">List rate</p>
          <p className="text-xl font-semibold text-ink">
            {formatMoney(course.listRate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Last rate paid</p>
          <p className="text-xl font-semibold text-ink">
            {formatMoney(course.lastNegotiatedRate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Last Booked</p>
          <p className="text-xl font-semibold text-ink">
            {course.lastEventDate ? formatDate(course.lastEventDate) : 'Never'}
          </p>
        </div>
      </div>
    </div>
  )
}
