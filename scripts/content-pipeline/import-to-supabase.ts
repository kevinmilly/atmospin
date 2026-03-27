import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface GeneratedChallenge {
  location: { name: string; lat: number; lng: number; country: string; continent: string; type: string }
  event: { title: string; description: string; year_start: number; era: string; tags: string[] }
  challenge: { prompt_text: string; hints: string[]; difficulty: number; fun_fact: string }
}

async function main() {
  const dataPath = join(__dirname, 'data/generated-challenges.json')
  const challenges: GeneratedChallenge[] = JSON.parse(readFileSync(dataPath, 'utf-8'))

  console.log(`Importing ${challenges.length} challenges to Supabase...\n`)

  let imported = 0

  for (const c of challenges) {
    // Upsert location
    const { data: loc, error: locErr } = await supabase
      .from('locations')
      .upsert({
        name: c.location.name,
        lat: c.location.lat,
        lng: c.location.lng,
        country: c.location.country,
        continent: c.location.continent,
        type: c.location.type,
      }, { onConflict: 'name' })
      .select('id')
      .single()

    if (locErr) {
      // If upsert fails (no unique constraint on name), try insert
      const { data: locInsert, error: locInsertErr } = await supabase
        .from('locations')
        .insert({
          name: c.location.name,
          lat: c.location.lat,
          lng: c.location.lng,
          country: c.location.country,
          continent: c.location.continent,
          type: c.location.type,
        })
        .select('id')
        .single()

      if (locInsertErr) {
        console.error(`  ✗ Location "${c.location.name}": ${locInsertErr.message}`)
        continue
      }
      var locationId = locInsert.id
    } else {
      var locationId = loc.id
    }

    // Insert event
    const { data: evt, error: evtErr } = await supabase
      .from('historical_events')
      .insert({
        location_id: locationId,
        title: c.event.title,
        description: c.event.description,
        year_start: c.event.year_start,
        era: c.event.era,
        tags: c.event.tags,
      })
      .select('id')
      .single()

    if (evtErr) {
      console.error(`  ✗ Event "${c.event.title}": ${evtErr.message}`)
      continue
    }

    // Insert challenge
    const { error: chErr } = await supabase
      .from('hunt_challenges')
      .insert({
        event_id: evt.id,
        prompt_text: c.challenge.prompt_text,
        hints: c.challenge.hints,
        difficulty: c.challenge.difficulty,
        fun_fact: c.challenge.fun_fact,
        is_published: true,
      })

    if (chErr) {
      console.error(`  ✗ Challenge for "${c.event.title}": ${chErr.message}`)
      continue
    }

    console.log(`  ✓ ${c.event.title}`)
    imported++
  }

  console.log(`\nDone! Imported ${imported}/${challenges.length} challenges.`)
}

main()
