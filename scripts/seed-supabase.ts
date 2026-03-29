/**
 * scripts/seed-supabase.ts
 * Reads enriched-places.json and upserts all rows into Supabase geo_places.
 * Run: npx tsx scripts/seed-supabase.ts [--limit N]
 *
 * Make sure to run the SQL migration first:
 *   supabase/migrations/001_geo_places.sql
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENRICHED = join(__dirname, 'data', 'enriched-places.json')
const BATCH_SIZE = 100

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env.local')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const limitArg = args.indexOf('--limit')
  const LIMIT = limitArg >= 0 ? parseInt(args[limitArg + 1]) : Infinity

  const supabase = createClient(url, key)
  const all = JSON.parse(readFileSync(ENRICHED, 'utf8'))
  const places = LIMIT === Infinity ? all : all.slice(0, LIMIT)

  console.log(`📤 Seeding ${places.length} places to Supabase...\n`)

  let seeded = 0
  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('geo_places')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`\n❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message)
      process.exit(1)
    }
    seeded += batch.length
    process.stdout.write(`  [${seeded}/${places.length}]\r`)
  }

  console.log(`\n✅ ${seeded} places seeded successfully`)

  // Verify count
  const { count } = await supabase
    .from('geo_places')
    .select('*', { count: 'exact', head: true })
  console.log(`📊 Total rows in geo_places: ${count}`)
}

main().catch(err => { console.error(err); process.exit(1) })
