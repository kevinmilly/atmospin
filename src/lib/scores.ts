import { supabase } from './supabase'

interface GeoScoreParams {
  userId: string
  placeId: string
  score: number
  distanceKm: number
  difficulty: number
}

/** Persist a Globe Spin round score to Supabase. Fire-and-forget — never throws. */
export async function submitGeoScore(params: GeoScoreParams): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('geo_scores').insert({
      user_id: params.userId,
      place_id: params.placeId,
      score: params.score,
      distance_km: params.distanceKm,
      difficulty: params.difficulty,
    })
  } catch {
    // Non-critical — scores are best-effort
  }
}
