/**
 * scripts/create-table.ts
 * Creates the geo_places table in Supabase using the REST API directly.
 * Run: npx tsx scripts/create-table.ts
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_KEY!

const sql = `
CREATE TABLE IF NOT EXISTS geo_places (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  category        TEXT DEFAULT 'landmark',
  difficulty      INT DEFAULT 3,
  prompt          TEXT,
  hints           JSONB DEFAULT '[]',
  fun_fact        TEXT,
  learn_fact      TEXT,
  quiz_question   TEXT,
  quiz_answers    JSONB DEFAULT '[]',
  quiz_correct    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE geo_places ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='geo_places' AND policyname='Public read'
  ) THEN
    CREATE POLICY "Public read" ON geo_places FOR SELECT USING (true);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS geo_places_difficulty_idx ON geo_places(difficulty);
CREATE INDEX IF NOT EXISTS geo_places_category_idx ON geo_places(category);
`

const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sql }),
})

if (res.ok) {
  console.log('✅ Table created')
} else {
  // Supabase doesn't expose exec_sql by default — use the pg connection via REST
  // Fall back: just try inserting a dummy row to see if table exists
  const check = await fetch(`${url}/rest/v1/geo_places?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  })
  if (check.ok) {
    console.log('✅ Table already exists — ready to seed')
  } else {
    const body = await check.text()
    if (body.includes('does not exist') || body.includes('relation')) {
      console.log('\n⚠️  Table does not exist yet.')
      console.log('Please run this SQL in your Supabase dashboard → SQL Editor:\n')
      console.log('   https://supabase.com/dashboard/project/_/sql\n')
      console.log('─'.repeat(60))
      console.log(sql)
      console.log('─'.repeat(60))
    } else {
      console.log('Status:', check.status, body)
    }
  }
}
