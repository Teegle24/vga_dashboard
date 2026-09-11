/**
 * Seeds clearly-labeled demo data so rate tracking has something to show before
 * any real history exists.
 *
 *   npm run seed:demo    # write sample courses, contacts, events, standby list
 *   npm run seed:purge   # remove every sample row
 *
 * Everything written here is tagged `source = 'sample'`, which is what the
 * in-app banner keys off and what the purge deletes. Tying demo data to a source
 * value rather than scattering rows means it can never be confused with real
 * entries a director typed.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  COURSE_SEEDS,
  EVENT_SEEDS,
  WAITLIST_SEEDS,
  slugify,
} from '../shared/idaho-seed.ts'

function client(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
    process.exit(1)
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** `YYYY-MM-DD`, `offset` days from today. */
function day(offset: number): string {
  return new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)
}

function ago(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

async function purge(db: SupabaseClient) {
  // Waitlist rows cascade from events, so deleting sample events is enough.
  const { data: sampleEvents } = await db
    .from('events')
    .select('id')
    .eq('source', 'sample')

  const { error: eventError } = await db
    .from('events')
    .delete()
    .eq('source', 'sample')
  if (eventError) throw new Error(eventError.message)

  const { error: courseError } = await db
    .from('courses')
    .delete()
    .eq('source', 'sample')
  if (courseError) throw new Error(courseError.message)

  console.log(
    `Purged ${sampleEvents?.length ?? 0} sample event(s) and all sample courses.`,
  )
  console.log('Anything a director entered was left alone.')
}

async function seed(db: SupabaseClient) {
  // Courses
  const courseIdBySlug = new Map<string, string>()

  for (let i = 0; i < COURSE_SEEDS.length; i += 1) {
    const seedRow = COURSE_SEEDS[i]!
    const slug = slugify(seedRow.name)

    const { data, error } = await db
      .from('courses')
      .upsert(
        {
          slug,
          name: seedRow.name,
          address: seedRow.address,
          city: seedRow.city,
          state_code: 'ID',
          zip: seedRow.zip,
          phone: `208-555-0${String(200 + i).slice(-3)}`,
          website: seedRow.website,
          list_rate: seedRow.listRate,
          source: 'sample',
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single()

    if (error) throw new Error(`${seedRow.name}: ${error.message}`)
    courseIdBySlug.set(slug, data.id)

    if (seedRow.contact) {
      const { error: contactError } = await db.from('course_contacts').upsert(
        {
          course_id: data.id,
          contact_name: seedRow.contact.name,
          email: seedRow.contact.email,
          phone: seedRow.contact.phone,
          last_confirmed_date: day(-seedRow.contact.confirmedDaysAgo),
          notes: seedRow.contact.notes ?? null,
          updated_at: ago(seedRow.contact.confirmedDaysAgo),
          updated_by: seedRow.contact.by,
        },
        { onConflict: 'course_id' },
      )
      if (contactError) throw new Error(contactError.message)
    }
  }

  console.log(`Seeded ${courseIdBySlug.size} course(s).`)

  // Events
  const eventIdByName = new Map<string, string>()

  for (const eventSeed of EVENT_SEEDS) {
    const courseId = courseIdBySlug.get(eventSeed.courseSlug)
    if (!courseId) {
      console.warn(`  skipped ${eventSeed.name}: no course ${eventSeed.courseSlug}`)
      continue
    }

    const { data, error } = await db
      .from('events')
      .insert({
        course_id: courseId,
        state_code: 'ID',
        name: eventSeed.name,
        event_date: day(eventSeed.offsetDays),
        headcount: eventSeed.headcount,
        rate_paid: eventSeed.ratePaid,
        is_tournament: eventSeed.isTournament,
        headcount_sent_at: eventSeed.headcountSent
          ? ago(Math.abs(eventSeed.offsetDays) + 7)
          : null,
        tee_sheet_sent_at: eventSeed.teeSheetSent
          ? ago(Math.abs(eventSeed.offsetDays) + 2)
          : null,
        source: 'sample',
        updated_by: 'Mark Brinkman',
      })
      .select('id')
      .single()

    if (error) throw new Error(`${eventSeed.name}: ${error.message}`)
    eventIdByName.set(eventSeed.name, data.id)
  }

  console.log(`Seeded ${eventIdByName.size} event(s). Rate history is now live.`)

  // Standby lists
  const rankByEvent = new Map<string, number>()

  for (const waitSeed of WAITLIST_SEEDS) {
    const eventId = eventIdByName.get(waitSeed.eventName)
    if (!eventId) continue

    const rank = (rankByEvent.get(eventId) ?? 0) + 1
    rankByEvent.set(eventId, rank)

    const { error } = await db.from('waitlist_entries').insert({
      event_id: eventId,
      rank,
      member_name: waitSeed.memberName,
      phone: waitSeed.phone,
      status: 'waiting',
    })
    if (error) throw new Error(error.message)
  }

  console.log(`Seeded ${WAITLIST_SEEDS.length} standby entr(ies).`)
  console.log('\nAll of it is tagged source=sample. Remove with: npm run seed:purge')
}

async function main() {
  const db = client()
  if (process.argv.includes('--purge')) {
    await purge(db)
  } else {
    await seed(db)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
