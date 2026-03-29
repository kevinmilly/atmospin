/**
 * scripts/run-migration.ts
 * Applies the geo_places table migration via Supabase Management API.
 * Run: npx tsx scripts/run-migration.ts
 */
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))

// Extract project ref from Supabase URL
const supabaseUrl = process.env.SUPABASE_URL!
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
const serviceKey = process.env.SUPABASE_SERVICE_KEY!

const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '001_geo_places.sql'), 'utf8')

// Use Supabase Management API to run SQL
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

if (res.ok) {
  console.log('✅ Migration applied successfully — geo_places table created')
} else {
  const body = await res.text()
  // Try alternative: use postgres REST endpoint
  const res2 = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  })
  console.log('\n⚠️  Could not auto-apply migration via API.')
  console.log('Please run this SQL manually in your Supabase SQL Editor:')
  console.log('→ https://supabase.com/dashboard/project/' + projectRef + '/sql\n')
  console.log('Copy and paste the contents of: supabase/migrations/001_geo_places.sql\n')
  console.log('Then run: npm run pipeline:seed\n')
  console.log('API response:', res.status, body.slice(0, 200))
}
