/**
 * Imports the Idaho course list from a CSV.
 *
 *   npm run import:courses -- path/to/idaho-courses.csv
 *   npm run import:courses -- path/to/idaho-courses.csv --dry-run
 *
 * Expected headers (extra columns are ignored, order doesn't matter):
 *   name,address,city,state,zip,phone,website,list_rate
 *
 * Only source-owned columns are written. Course contacts, notes, and events are
 * director-owned and are never touched here, so re-running this against an
 * updated dataset cannot wipe work someone entered by hand.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { slugify } from '../shared/idaho-seed.ts'

const SOURCE_OWNED = [
  'name',
  'address',
  'city',
  'state_code',
  'zip',
  'phone',
  'website',
] as const

interface CsvRow {
  name?: string
  address?: string
  city?: string
  state?: string
  state_code?: string
  zip?: string
  phone?: string
  website?: string
  list_rate?: string
}

function client() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
    process.exit(1)
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const file = args.find((arg) => !arg.startsWith('--'))

  if (!file) {
    console.error('Usage: npm run import:courses -- <file.csv> [--dry-run]')
    process.exit(1)
  }

  const rows = parse(readFileSync(file, 'utf8'), {
    columns: (header: string[]) =>
      header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_')),
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[]

  const prepared = rows
    .filter((row) => clean(row.name))
    .map((row) => ({
      slug: slugify(row.name!),
      name: clean(row.name)!,
      address: clean(row.address),
      city: clean(row.city),
      state_code: clean(row.state_code) ?? clean(row.state) ?? 'ID',
      zip: clean(row.zip),
      phone: clean(row.phone),
      website: clean(row.website),
      list_rate: row.list_rate ? Number(row.list_rate) : null,
      source: 'csv' as const,
    }))

  console.log(`Parsed ${prepared.length} course(s) from ${file}`)

  if (dryRun) {
    for (const course of prepared) {
      console.log(`  ${course.name} — ${course.city ?? '?'} (${course.slug})`)
    }
    console.log('\nDry run: nothing written.')
    return
  }

  const db = client()
  let inserted = 0
  let updated = 0

  for (const course of prepared) {
    const { data: existing } = await db
      .from('courses')
      .select('id, list_rate')
      .eq('slug', course.slug)
      .maybeSingle()

    if (existing) {
      // Write only the source-owned columns. Leave list_rate alone if a
      // director has already set one.
      const patch: Record<string, unknown> = {}
      for (const key of SOURCE_OWNED) patch[key] = course[key]
      if (existing.list_rate === null && course.list_rate !== null) {
        patch.list_rate = course.list_rate
      }

      const { error } = await db.from('courses').update(patch).eq('id', existing.id)
      if (error) {
        console.error(`  failed: ${course.name} — ${error.message}`)
        continue
      }
      updated += 1
    } else {
      const { error } = await db.from('courses').insert(course)
      if (error) {
        console.error(`  failed: ${course.name} — ${error.message}`)
        continue
      }
      inserted += 1
    }
  }

  console.log(`\nDone. ${inserted} added, ${updated} updated.`)
  console.log('Contacts, notes, and events were left untouched.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
