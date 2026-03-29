/**
 * src/lib/places.ts
 * Fetches geo challenges from Supabase with a localStorage cache fallback.
 * Falls back to the local JSON if Supabase is unavailable.
 */

import { supabase } from './supabase'
import type { GeoChallenge } from '@/store/globeSpin'
import localPlaces from '@/data/geo-places.json'

const CACHE_KEY = 'atmospin_places_cache'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  places: GeoChallenge[]
  ts: number
}

function readCache(): GeoChallenge[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null
    return entry.places
  } catch {
    return null
  }
}

function writeCache(places: GeoChallenge[]) {
  try {
    const entry: CacheEntry = { places, ts: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Storage quota exceeded — skip caching
  }
}

/** Fetch a random place from Supabase, with cache + local-JSON fallback. */
export async function fetchRandomPlace(difficulty?: number): Promise<GeoChallenge> {
  if (supabase) {
    try {
      let query = supabase
        .from('geo_places')
        .select('id,name,country,lat,lng,category,difficulty,prompt,hints,fun_fact')

      if (difficulty) query = query.eq('difficulty', difficulty)

      // Random row via Postgres random ordering
      const { data, error } = await query
        .order('id') // stable order needed before limit
        .limit(500)  // pull a pool, pick randomly client-side for true randomness

      if (!error && data && data.length > 0) {
        const place = data[Math.floor(Math.random() * data.length)] as GeoChallenge
        return place
      }
    } catch {
      // Fall through to cache/local
    }
  }

  // Cache fallback
  const cached = readCache()
  if (cached && cached.length > 0) {
    return cached[Math.floor(Math.random() * cached.length)]
  }

  // Local JSON fallback
  const pool = difficulty
    ? (localPlaces as GeoChallenge[]).filter(p => p.difficulty === difficulty)
    : (localPlaces as GeoChallenge[])
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Fetch a random place that has Learn Mode content. */
export async function fetchRandomLearnPlace(): Promise<GeoChallenge | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('geo_places')
        .select('*')
        .not('learn_fact', 'is', null)
        .limit(500)

      if (!error && data && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)] as GeoChallenge
      }
    } catch {
      // Fall through
    }
  }

  // Local JSON fallback — use fun_fact as learn_fact for local places
  const place = (localPlaces as GeoChallenge[])[Math.floor(Math.random() * localPlaces.length)]
  return {
    ...place,
    learn_fact: place.fun_fact,
    quiz_question: `What is interesting about ${place.name}?`,
    quiz_answers: [place.fun_fact.slice(0, 60), 'It has no notable features', 'It was built in 1900', 'It is the largest in the world'],
    quiz_correct: 0,
  }
}

/** Prime the cache in the background after app load. */
export async function primePlacesCache() {
  if (!supabase) return
  const cached = readCache()
  if (cached) return // still fresh

  try {
    const { data } = await supabase
      .from('geo_places')
      .select('id,name,country,lat,lng,category,difficulty,prompt,hints,fun_fact')
      .limit(100)

    if (data && data.length > 0) writeCache(data as GeoChallenge[])
  } catch {
    // Non-critical
  }
}
