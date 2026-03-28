/**
 * Estimate which continent a lat/lng coordinate falls in.
 * Rough approximation — good enough for achievement tracking.
 */
export function estimateContinent(lat: number, lng: number): string {
  if (lat < -60) return 'Antarctica'
  // Oceania / Pacific
  if (lat < -10 && lng > 100) return 'Oceania'
  if (lat < 20 && lat > -10 && lng > 140) return 'Oceania'
  if (lat < -10 && lng > 50 && lng < 100) return 'Oceania' // islands
  // South America
  if (lat < 15 && lat > -60 && lng > -85 && lng < -30) return 'South America'
  // North America
  if (lat > 5 && lat < 85 && lng > -170 && lng < -45) return 'North America'
  // Europe
  if (lat > 35 && lat < 72 && lng > -25 && lng < 45) return 'Europe'
  if (lat > 60 && lng > -30 && lng < 70) return 'Europe' // Northern Europe
  // Africa
  if (lat > -37 && lat < 38 && lng > -20 && lng < 55) return 'Africa'
  // Asia (catch-all for remaining eastern/northern areas)
  return 'Asia'
}

/**
 * Reverse-geocode a lat/lng to a country name using Nominatim (OpenStreetMap).
 * Falls back to continent name if the request fails.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&format=json&zoom=5`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'Atmospin/1.0' },
    })
    if (!res.ok) throw new Error('nominatim error')
    const data = await res.json()
    // zoom=5 returns country-level, prefer `country` field
    return data.address?.country ?? data.display_name?.split(',').at(-1)?.trim() ?? estimateContinent(lat, lng)
  } catch {
    return estimateContinent(lat, lng)
  }
}
