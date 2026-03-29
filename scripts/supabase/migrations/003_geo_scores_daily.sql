-- Migration 003: add daily challenge metadata to geo_scores
alter table if exists geo_scores
  add column if not exists run_mode text not null default 'quick';

alter table if exists geo_scores
  add column if not exists daily_key text;

create index if not exists idx_geo_scores_run_mode on geo_scores(run_mode);
create index if not exists idx_geo_scores_daily_key on geo_scores(daily_key);
