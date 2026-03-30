import type { GlobePoint } from '@/types'

/** Haversine distance between two points in kilometers */
export function haversineDistance(a: GlobePoint, b: GlobePoint): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Calculate distance score: full 1000 within 50km grace zone, then exponential decay */
export function calcDistanceScore(distanceKm: number): number {
  const graced = Math.max(0, distanceKm - 50)
  return Math.max(0, Math.round(1000 * Math.exp(-graced / 1500)))
}

/** Calculate time score: 500 at exact year, 0 at 100+ years off */
export function calcTimeScore(yearDiff: number): number {
  return Math.max(0, Math.round(500 - Math.abs(yearDiff) * 5))
}

/** Calculate total score with hint penalty */
export function calcTotalScore(
  distanceScore: number,
  timeScore: number,
  hintsUsed: number,
): number {
  const hintPenalty = hintsUsed * 100
  return Math.max(0, distanceScore + timeScore - hintPenalty)
}

/** Speed bonus for submitting early: up to +150 pts */
export function calcSpeedBonus(timeRemaining: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0
  return Math.round((timeRemaining / totalSeconds) * 150)
}

/** Full scoring calculation */
export function calculateScore(
  playerPin: GlobePoint,
  playerYear: number,
  targetLocation: GlobePoint,
  targetYear: number,
  hintsUsed: number,
) {
  const distanceKm = haversineDistance(playerPin, targetLocation)
  const yearDiff = playerYear - targetYear
  const distanceScore = calcDistanceScore(distanceKm)
  const timeScore = calcTimeScore(yearDiff)
  const totalScore = calcTotalScore(distanceScore, timeScore, hintsUsed)

  return {
    distanceKm: Math.round(distanceKm),
    yearDiff,
    distanceScore,
    timeScore,
    hintsUsed,
    totalScore,
  }
}
