import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface LeaderboardEntry {
  user_id: string
  total: number
  games_played: number
  avg_score: number
  email?: string
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(100)

    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { entries, loading, refresh: fetch }
}
