-- VGA Idaho course directory — initial schema.
--
-- Two ideas shape this file:
--   1. Source-owned vs director-owned columns. A CSV or future Teegle sync only
--      ever writes the `courses` identity columns. Contacts, notes, and events
--      belong to the directors and are never touched by an import.
--   2. Rate history is derived. Directors log events; a trigger rolls the newest
--      rate onto the course. Nobody maintains a rate field by hand.

create extension if not exists "pgcrypto";

-- Where a row came from. 'sample' rows are demo data and are purgeable.
create type data_source as enum ('csv', 'teegle', 'manual', 'sample', 'golf_genius');
create type waitlist_status as enum ('waiting', 'offered', 'filled', 'declined');
create type director_role as enum ('state_director', 'assistant_director');

-- ---------------------------------------------------------------------------
-- Courses (source-owned identity + derived rate summary)
-- ---------------------------------------------------------------------------
create table courses (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  name                  text not null,
  address               text,
  city                  text,
  -- Idaho-only for the demo, but present from the start so adding states later
  -- is a data change rather than a migration.
  state_code            text not null default 'ID',
  zip                   text,
  phone                 text,
  website               text,
  source                data_source not null default 'csv',
  teegle_course_id      text,
  -- Director-owned.
  list_rate             numeric(10, 2),
  -- Derived by trigger from `events`. Do not write directly.
  last_negotiated_rate  numeric(10, 2),
  last_event_date       date,
  deleted_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index courses_state_idx on courses (state_code) where deleted_at is null;
create unique index courses_name_city_idx
  on courses (lower(name), lower(coalesce(city, '')));

-- ---------------------------------------------------------------------------
-- Course contacts (director-owned — never written by an import)
-- ---------------------------------------------------------------------------
create table course_contacts (
  id                    uuid primary key default gen_random_uuid(),
  course_id             uuid not null references courses (id) on delete cascade,
  contact_name          text,
  email                 text,
  phone                 text,
  last_confirmed_date   date,
  notes                 text,
  deleted_at            timestamptz,
  updated_at            timestamptz not null default now(),
  updated_by            text,
  unique (course_id)
);

-- ---------------------------------------------------------------------------
-- Events — the event log, the tournament calendar, and the rate history
-- ---------------------------------------------------------------------------
create table events (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references courses (id) on delete cascade,
  state_code          text not null default 'ID',
  name                text not null,
  -- A tournament happens on a calendar day, not at an instant. `date` avoids a
  -- whole class of off-by-one bugs in the one-week headcount window.
  event_date          date not null,
  headcount           integer check (headcount is null or headcount >= 0),
  rate_paid           numeric(10, 2) check (rate_paid is null or rate_paid >= 0),
  is_tournament       boolean not null default true,
  headcount_sent_at   timestamptz,
  tee_sheet_sent_at   timestamptz,
  source              data_source not null default 'manual',
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  updated_by          text
);

create index events_course_idx on events (course_id) where deleted_at is null;
create index events_date_idx on events (event_date) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Rate derivation
-- ---------------------------------------------------------------------------
-- Recomputes a course's rate summary from its live events. Runs on insert,
-- update, and soft delete so "Last rate paid" can never drift from the log.
create or replace function refresh_course_rate(target_course uuid)
returns void
language plpgsql
as $$
begin
  update courses c
  set
    last_negotiated_rate = latest.rate_paid,
    last_event_date      = latest.event_date,
    updated_at           = now()
  from (
    select e.rate_paid, e.event_date
    from events e
    where e.course_id = target_course
      and e.deleted_at is null
      and e.rate_paid is not null
    order by e.event_date desc, e.created_at desc
    limit 1
  ) as latest
  where c.id = target_course;

  -- No priced events left: clear the summary rather than leaving a stale value.
  if not exists (
    select 1 from events e
    where e.course_id = target_course
      and e.deleted_at is null
      and e.rate_paid is not null
  ) then
    update courses
    set last_negotiated_rate = null, last_event_date = null, updated_at = now()
    where id = target_course;
  end if;
end;
$$;

create or replace function events_refresh_rate()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform refresh_course_rate(old.course_id);
    return old;
  end if;

  perform refresh_course_rate(new.course_id);
  -- A moved event has to update both the old and new course.
  if tg_op = 'UPDATE' and old.course_id is distinct from new.course_id then
    perform refresh_course_rate(old.course_id);
  end if;
  return new;
end;
$$;

create trigger events_rate_trigger
after insert or update or delete on events
for each row execute function events_refresh_rate();

-- ---------------------------------------------------------------------------
-- Waitlist — ranked standby per event
-- ---------------------------------------------------------------------------
create table waitlist_entries (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events (id) on delete cascade,
  rank         integer not null,
  member_name  text not null,
  phone        text,
  email        text,
  status       waitlist_status not null default 'waiting',
  created_at   timestamptz not null default now()
);

create index waitlist_event_idx on waitlist_entries (event_id, rank);

-- ---------------------------------------------------------------------------
-- SMS consent (phase 3) — append-only for TCPA defensibility
-- ---------------------------------------------------------------------------
-- An opt-out inserts a new row rather than mutating the opt-in, so the full
-- consent history is preserved. This is deliberately separate from any Teegle
-- course-alert subscription: consent here is per event registration.
create table sms_consents (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid references events (id) on delete set null,
  participant_name   text,
  participant_phone  text not null,
  opted_in           boolean not null,
  opted_in_at        timestamptz,
  opted_out_at       timestamptz,
  consent_version    text not null default 'v1',
  consent_source     text not null default 'web_form',
  created_at         timestamptz not null default now()
);

create index sms_consents_phone_idx on sms_consents (participant_phone, created_at desc);

-- ---------------------------------------------------------------------------
-- Directors — present for the multi-state build, unused by the demo UI
-- ---------------------------------------------------------------------------
create table directors (
  id             uuid primary key default gen_random_uuid(),
  clerk_user_id  text unique,
  email          text not null unique,
  name           text,
  state_code     text not null default 'ID',
  role           director_role not null default 'assistant_director',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit + feedback
-- ---------------------------------------------------------------------------
create table change_log (
  id          bigserial primary key,
  table_name  text not null,
  row_id      text not null,
  field       text not null,
  old_value   text,
  new_value   text,
  actor_email text,
  changed_at  timestamptz not null default now()
);

create index change_log_row_idx on change_log (table_name, row_id, changed_at desc);

create table feedback (
  id          uuid primary key default gen_random_uuid(),
  actor_email text,
  message     text not null,
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
-- The API is the only client and it uses the service role, which bypasses RLS.
-- Enabling it with no permissive policies means a leaked anon key still reads
-- nothing.
alter table courses           enable row level security;
alter table course_contacts   enable row level security;
alter table events            enable row level security;
alter table waitlist_entries  enable row level security;
alter table sms_consents      enable row level security;
alter table directors         enable row level security;
alter table change_log        enable row level security;
alter table feedback          enable row level security;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_touch before update on courses
for each row execute function touch_updated_at();

create trigger events_touch before update on events
for each row execute function touch_updated_at();
