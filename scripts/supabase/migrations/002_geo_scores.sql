-- Migration 002: Globe Spin scores table + updated leaderboard view
-- Run this in the Supabase SQL Editor

-- Globe Spin round scores (place_id is a text ID from geo_places, not UUID)
create table if not exists geo_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  place_id text not null,
  score integer not null default 0,
  distance_km double precision,
  difficulty integer,
  played_at timestamptz default now()
);

-- Indexes
create index if not exists idx_geo_scores_user on geo_scores(user_id);
create index if not exists idx_geo_scores_played_at on geo_scores(played_at);

-- RLS
alter table geo_scores enable row level security;

create policy "Users can insert own geo scores" on geo_scores
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Geo scores readable by all" on geo_scores
  for select to authenticated using (true);

create policy "Geo scores readable by anon" on geo_scores
  for select to anon using (true);

-- Updated leaderboard view: unions both hunt scores and globe spin scores
create or replace view leaderboard as
  select
    user_id,
    sum(total) as total,
    sum(games_played) as games_played,
    round(sum(total)::numeric / nullif(sum(games_played), 0)) as avg_score
  from (
    -- Original hunt scores
    select user_id, sum(total_score) as total, count(*) as games_played
    from scores
    group by user_id

    union all

    -- Globe Spin scores
    select user_id, sum(score) as total, count(*) as games_played
    from geo_scores
    group by user_id
  ) combined
  group by user_id
  order by total desc;
