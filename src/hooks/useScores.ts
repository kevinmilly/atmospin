import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { ScoreResult } from '@/store/hunt'

export function useScores() {
  const session = useAuthStore(s => s.session)

  const submitScore = useCallback(async (challengeId: string, result: ScoreResult) => {
    if (!supabase || !session?.user) return

    await supabase.from('scores').insert({
      user_id: session.user.id,
      challenge_id: challengeId,
      distance_km: result.distanceKm,
      year_diff: result.yearDiff,
      distance_score: result.distanceScore,
      time_score: result.timeScore,
      total_score: result.totalScore,
    })
  }, [session])

  return { submitScore }
}
