-- The Weave: Core schema
-- Run this in the Supabase SQL Editor

-- Locations: real-world places
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  country text,
  continent text,
  type text check (type in ('city','landmark','region','body_of_water','other')),
  created_at timestamptz default now()
);

-- Historical events tied to locations
create table if not exists historical_events (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  title text not null,
  description text,
  year_start integer not null,
  year_end integer,
  era text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Hunt challenges: the actual game content
create table if not exists hunt_challenges (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references historical_events(id) on delete cascade,
  prompt_text text not null,
  hints text[] default '{}',
  clue_layers jsonb default '[]',
  difficulty integer check (difficulty between 1 and 5),
  fun_fact text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Player scores
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  challenge_id uuid references hunt_challenges(id) on delete cascade,
  distance_km double precision,
  year_diff integer,
  distance_score integer,
  time_score integer,
  total_score integer,
  played_at timestamptz default now()
);

-- Leaderboard view
create or replace view leaderboard as
  select
    user_id,
    sum(total_score) as total,
    count(*) as games_played,
    round(avg(total_score)) as avg_score
  from scores
  group by user_id
  order by total desc;

-- Indexes
create index if not exists idx_scores_user on scores(user_id);
create index if not exists idx_scores_challenge on scores(challenge_id);
create index if not exists idx_hunt_published on hunt_challenges(is_published) where is_published = true;
create index if not exists idx_events_location on historical_events(location_id);

-- RLS policies
alter table locations enable row level security;
alter table historical_events enable row level security;
alter table hunt_challenges enable row level security;
alter table scores enable row level security;

-- Read-only for all authenticated users
create policy "Locations readable by authenticated" on locations
  for select to authenticated using (true);

create policy "Events readable by authenticated" on historical_events
  for select to authenticated using (true);

create policy "Published challenges readable by authenticated" on hunt_challenges
  for select to authenticated using (is_published = true);

-- Also allow anonymous reads for playing without account
create policy "Locations readable by anon" on locations
  for select to anon using (true);

create policy "Events readable by anon" on historical_events
  for select to anon using (true);

create policy "Published challenges readable by anon" on hunt_challenges
  for select to anon using (is_published = true);

-- Scores: users can insert their own, read all
create policy "Users can insert own scores" on scores
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Scores readable by all" on scores
  for select to authenticated using (true);

create policy "Scores readable by anon" on scores
  for select to anon using (true);
