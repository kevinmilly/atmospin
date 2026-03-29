import localPlaces from '@/data/geo-places.json'
import type { GeoChallenge } from '@/store/globeSpin'
import { estimateContinent } from './geo'

function hashString(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6d2b79f5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function normalizePlace(place: GeoChallenge): GeoChallenge {
  return {
    ...place,
    continent: place.continent ?? estimateContinent(place.lat, place.lng),
  }
}

export function getDailyKey(date = new Date()) {
  return date.toLocaleDateString('en-CA')
}

export function getDailyChallengeSet(count = 3, key = getDailyKey()): GeoChallenge[] {
  const seeded = mulberry32(hashString(`daily:${key}`))
  const pool = (localPlaces as GeoChallenge[])
    .map(normalizePlace)
    .sort((a, b) => a.id.localeCompare(b.id))

  const selected: GeoChallenge[] = []
  const usedIds = new Set<string>()

  while (selected.length < Math.min(count, pool.length)) {
    const pick = pool[Math.floor(seeded() * pool.length)]
    if (usedIds.has(pick.id)) continue
    usedIds.add(pick.id)
    selected.push(pick)
  }

  return selected
}
