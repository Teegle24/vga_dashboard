# VGA Dashboard — Idaho

A shared, always-current course contact and rate directory for **Veteran Golfers
Association** state and assistant directors. Built by **Teegle Golf**.

This is an Idaho-only demo, built to get feedback from Mark Brinkman (VGA Idaho
assistant director) before any wider build.

## The problem it solves

Two things go stale today:

1. **Course contact info** drifts, and nobody knows which version is current.
2. **Rate history** only exists in one person's head until it gets rebuilt by
   hand once a year from Golf Genius.

So rate tracking here is **derived, never typed**. Directors log events; a
Postgres trigger rolls the newest rate onto the course. "Last rate paid" can't
drift from the log because nothing maintains it separately.

## Designed for the people using it

Directors are mostly older and not especially tech-savvy, so:

- One scrollable page. No wizards, no modals, no tabs, no sidebar.
- 56px minimum tap targets, 18px base font size.
- Plain language everywhere — "Course Contact", not POC. "Last Booked", not
  last event timestamp.
- The two common actions take one or two taps: **search a course** shows its
  contact immediately, and the **log form** sits right beneath it.
- Phone numbers are `tel:` links and emails are `mailto:` links, so looking up
  a contact ends in an actual phone call.
- Deletes are soft, with an inline **Undo**, rather than a confirm dialog to
  misread.

## Run it

The demo runs with **no database and no Clerk keys**:

```bash
npm install
cp .env.example .env   # already sets VITE_USE_MOCK=true
npm run dev
```

Mock mode serves 18 real Idaho courses from local fixtures and persists your
edits to `localStorage`, so a walkthrough survives a refresh.

## Sample data

There is no Golf Genius export yet, so the demo seeds **labeled sample events**
— otherwise every rate card would open blank and undersell the whole point.

Everything seeded is tagged `source = 'sample'`, which is what the in-app banner
keys off and what the purge removes:

```bash
npm run seed:demo    # write sample courses, contacts, events, standby lists
npm run seed:purge   # remove every sample row, leaving real entries alone
```

Course names and cities are real Idaho courses so they're recognizable. Contacts
and phone numbers are invented, using the reserved `555-01xx` range so nothing
can be called by accident.

The real on-ramp for Mark is **backdated logging**: the log form accepts past
dates, so he can enter the last few events he remembers and watch his own rate
history appear.

## Importing the real course list

```bash
npm run import:courses -- path/to/idaho-courses.csv --dry-run
npm run import:courses -- path/to/idaho-courses.csv
```

Expected headers (extra columns ignored, order doesn't matter):

```
name,address,city,state,zip,phone,website,list_rate
```

**The import only writes source-owned columns** — name, address, city, zip,
phone, website. Contacts, notes, and events are director-owned and are never
touched, so re-importing an updated dataset cannot wipe work Mark entered by
hand. That separation is also what makes a future sync against Teegle's own
course dataset safe; `courses.teegle_course_id` is there to link them.

## Architecture

```
src/       Vite + React SPA (the only thing a director touches)
server/    Hono API — Clerk JWT verification, Supabase writes, cron, webhooks
shared/    Types + seed data imported by both, so the contract can't drift
supabase/  Schema migrations
scripts/   CSV import and demo seeding
```

The SPA never holds a Supabase key. It calls the API, which uses the service
role. Row level security is enabled on every table with no permissive policies,
so a leaked anon key reads nothing.

### Going live

1. Run `supabase/migrations/0001_init.sql` against a Supabase project.
2. Set the API and Clerk variables from `.env.example`.
3. Set `VITE_USE_MOCK=false`.

`ALLOWED_EMAILS` is a comma-separated allowlist. The demo intentionally has no
role model — state vs assistant director can wait for real feedback.

## Feature status

| Feature | Status |
|---|---|
| Course directory | Done |
| Course contact per course, with confirm date and notes | Done |
| Rate tracking derived from the event log | Done |
| Event log, accepts past dates | Done |
| Tournament calendar | Done |
| Ranked standby list per event | Done |
| Headcount reminder at one week out | In app; cron endpoint ready, email pending |
| Tee sheet handoff | Downloads a CSV of foursomes |
| SMS reminders to participants | Not started — see below |

### SMS is deliberately not live

`server/routes/twilio.ts` handles `STOP` replies and `sms_consents` is
append-only (an opt-out inserts a row rather than mutating the opt-in, so
consent history stays defensible). Sending is not wired up, because it needs
Twilio credentials **and** confirmation that Teegle's existing 10DLC campaign
use-case covers event-registration reminders. That's carrier paperwork with real
lead time, and it's a separate consent flow from any course-alert subscription —
consent here is per event registration.

## Out of scope, on purpose

- Credit card holds — a VGA finance problem, not a software one.
- Full tee-sheet management — Mark says this part isn't painful. We only
  generate the sheet he emails over.
- Multi-state rollout — the schema carries `state_code` throughout and nothing
  hardcodes `'ID'` in a component, so adding states is additive.

## Notes for whoever builds phase 2

- `src/lib/dates.ts` owns all calendar math, in `America/Boise`. Event dates are
  Postgres `date`, not timestamps — a tournament is a calendar day, not an
  instant. The headcount window is 6–8 days out rather than exactly 7, so a
  delayed cron run can't step over an event.
- `change_log` records who changed what. Cards show "Updated by <name>
  <when>", because a shared directory is only trusted if you can see that.
- Tee sheet columns in `src/lib/tee-sheet.ts` are a reasonable guess. Worth
  replacing with a real sheet a course sent Mark.
