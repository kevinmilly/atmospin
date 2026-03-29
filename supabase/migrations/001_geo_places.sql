-- Run this in your Supabase SQL editor before seeding

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
  -- Learn Mode columns
  learn_fact      TEXT,
  quiz_question   TEXT,
  quiz_answers    JSONB DEFAULT '[]',  -- string[4], index 0 is always correct
  quiz_correct    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, no public write (service key only for writes)
ALTER TABLE geo_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON geo_places
  FOR SELECT USING (true);

-- Index for fast random sampling per difficulty
CREATE INDEX IF NOT EXISTS geo_places_difficulty_idx ON geo_places(difficulty);
CREATE INDEX IF NOT EXISTS geo_places_category_idx ON geo_places(category);
