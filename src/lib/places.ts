/**
 * src/lib/places.ts
 * Fetches geo challenges from Supabase with an in-memory pool,
 * localStorage cache, and local JSON fallbacks.
 */

import { supabase } from './supabase'
import type { GeoChallenge } from '@/store/globeSpin'
import localPlaces from '@/data/geo-places.json'
import { estimateContinent } from './geo'

const CACHE_KEY = 'atmospin_places_cache'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const POOL_SIZE = 500

// In-memory pool — populated once per session on app init
let placePool: GeoChallenge[] = []
let poolPrimed = false
let primePromise: Promise<void> | null = null

interface CacheEntry {
  places: GeoChallenge[]
  ts: number
}

export interface FetchPlaceOptions {
  difficulty?: number
  continent?: string
  excludeIds?: string[]
}

function normalizePlace(place: GeoChallenge): GeoChallenge {
  return {
    ...place,
    continent: place.continent ?? estimateContinent(place.lat, place.lng),
  }
}

function matchesFilters(place: GeoChallenge, options: FetchPlaceOptions) {
  if (options.difficulty && place.difficulty !== options.difficulty) return false
  if (options.continent) {
    const continent = place.continent ?? estimateContinent(place.lat, place.lng)
    if (continent !== options.continent) return false
  }
  if (options.excludeIds?.includes(place.id)) return false
  return true
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

function pickAndRemove(pool: GeoChallenge[], options: FetchPlaceOptions = {}): GeoChallenge | null {
  const candidates = pool.filter(p => matchesFilters(p, options))
  if (candidates.length === 0) return null
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  const idx = pool.indexOf(pick)
  if (idx !== -1) pool.splice(idx, 1)
  return normalizePlace(pick)
}

/** Prime the in-memory pool. Called once on app init; subsequent calls are no-ops. */
export async function primePlacesCache() {
  if (poolPrimed) return
  if (primePromise) return primePromise

  primePromise = (async () => {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('geo_places')
          .select('id,name,country,lat,lng,category,difficulty,prompt,hints,fun_fact')
          .limit(POOL_SIZE)

        if (data && data.length > 0) {
          placePool = (data as GeoChallenge[]).map(normalizePlace)
          // Shuffle pool for randomness
          for (let i = placePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [placePool[i], placePool[j]] = [placePool[j], placePool[i]]
          }
          writeCache(placePool.slice(0, 100))
          poolPrimed = true
          return
        }
      } catch {
        // Fall through to local fallback
      }
    }

    // Fall back: use localStorage cache or local JSON
    const cached = readCache()
    placePool = (cached ?? (localPlaces as GeoChallenge[])).map(normalizePlace).slice()
    // Shuffle
    for (let i = placePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [placePool[i], placePool[j]] = [placePool[j], placePool[i]]
    }
    poolPrimed = true
  })()

  return primePromise
}

/** Fetch a random place — uses in-memory pool first (O(1), no network), refills if empty. */
export async function fetchRandomPlace(options: FetchPlaceOptions = {}): Promise<GeoChallenge> {
  // Ensure pool is primed (no-op if already done)
  if (!poolPrimed) await primePlacesCache()

  // Try in-memory pool first
  const fromPool = pickAndRemove(placePool, options)
  if (fromPool) return fromPool

  // Pool exhausted for this difficulty — refill from Supabase
  if (supabase) {
    try {
      const query = supabase
        .from('geo_places')
        .select('id,name,country,lat,lng,continent,subregion,category,difficulty,prompt,hints,fun_fact')

      const { data, error } = await query.limit(Math.max(POOL_SIZE, 1000))

      if (!error && data && data.length > 0) {
        // Refill pool with fresh data
        placePool = (data as GeoChallenge[]).map(normalizePlace)
        for (let i = placePool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [placePool[i], placePool[j]] = [placePool[j], placePool[i]]
        }
        const pick = pickAndRemove(placePool, options)
        if (pick) return pick
      }
    } catch {
      // Fall through
    }
  }

  // Local JSON fallback
  const pool = (localPlaces as GeoChallenge[])
    .map(normalizePlace)
    .filter(p => matchesFilters(p, options))
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)]
  const fallbackPool = (localPlaces as GeoChallenge[]).map(normalizePlace)
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
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
