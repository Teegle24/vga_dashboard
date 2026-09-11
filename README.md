# VGA Dashboard — Idaho

A shared, always-current course contact and rate directory for **Veteran Golfers
Association** state and assistant directors. Built by **Teegle Golf**.

This is an Idaho-only demo, built to get feedback from Mark Brinkman (VGA Idaho
assistant director) before any wider build.

## Run it

```bash
npm install
npm run dev
```

That's the whole setup. No database, no accounts, no API keys, no environment
variables — the directory lives in the browser and persists to `localStorage`,
so a walkthrough survives a refresh. **Start over** in the footer puts the
sample data back.

## The problem it solves

Two things go stale today:

1. **Course contact info** drifts, and nobody knows which version is current.
2. **Rate history** only exists in one person's head until it gets rebuilt by
   hand once a year from Golf Genius.

So rate tracking here is **derived, never typed**. Directors log events, and the
newest rate paid rolls onto the course automatically. "Last rate paid" can't
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

## Where the data lives

```
src/data/idaho-seed.ts   The 18 Idaho courses and their sample events
src/data/seed.ts         Builds the starting directory from that list
src/data/store.ts        Reads and writes, backed by localStorage
src/data/hooks.ts        React Query wrappers the components call
src/types.ts             The shape of everything
```

To change what the demo shows, edit `src/data/idaho-seed.ts` and click **Start
over**. When the real Idaho course list arrives, that one file gets replaced.

There is no Golf Genius export yet, so the demo ships **labeled sample events** —
otherwise every rate card would open blank and undersell the whole point.
Everything seeded is tagged `source: 'sample'`, which is what the in-app banner
keys off.

Course names and cities are real Idaho courses so they're recognizable. Contacts
and phone numbers are invented, using the reserved `555-01xx` range so nothing
can be called by accident.

The real on-ramp for Mark is **backdated logging**: the log form accepts past
dates, so he can enter the last few events he remembers and watch his own rate
history appear.

## Feature status

| Feature | Status |
|---|---|
| Course directory | Done |
| Course contact per course, with confirm date and notes | Done |
| Rate tracking derived from the event log | Done |
| Event log, accepts past dates | Done |
| Tournament calendar | Done |
| Ranked standby list per event | Done |
| Headcount reminder at one week out | Shown in app |
| Tee sheet handoff | Downloads a CSV of foursomes |
| SMS reminders to participants | Not built |

## Out of scope, on purpose

- Credit card holds — a VGA finance problem, not a software one.
- Full tee-sheet management — Mark says this part isn't painful. We only
  generate the sheet he emails over.
- Multi-state rollout — `stateCode` runs throughout and nothing hardcodes
  `'ID'` in a component, so adding states is additive.

## What this deliberately doesn't have yet

No server, no login, and no shared storage. Everything one person types stays in
that person's browser. That is the right trade for a layout review and the wrong
trade for real use, so the sequence is: get the layout right with Mark first,
then add persistence and accounts once the shape of the thing is settled.

The pieces that come back at that point are a small API, a Postgres schema,
email or SMS reminders, and a CSV importer for the course list. An earlier
revision of this repo had all of them; `git log` has the code if it's useful
reference, but it was guessing at requirements Mark hasn't confirmed.

## Notes for whoever builds next

- `src/lib/dates.ts` owns all calendar math, in `America/Boise`. Event dates are
  calendar days (`YYYY-MM-DD`), not timestamps — a tournament is a day, not an
  instant. The headcount window is 6–8 days out rather than exactly 7, so a
  reminder can't step over an event.
- Cards show "Updated by &lt;name&gt; &lt;when&gt;", because a shared directory
  is only trusted if you can see who touched it last.
- Tee sheet columns in `src/lib/tee-sheet.ts` are a reasonable guess. Worth
  replacing with a real sheet a course sent Mark.
- When a real course list shows up, keep course identity fields (name, address,
  phone, website) separate from director-entered fields (contacts, notes,
  events). Re-importing a dataset must never wipe what Mark typed by hand.
