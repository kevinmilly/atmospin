import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface LeaderboardEntry {
  user_id: string
  total: number
  games_played: number
  avg_score: number
  email?: string
}

interface UseLeaderboardOptions {
  mode?: 'all' | 'daily'
  dailyKey?: string
}

export function useLeaderboard({ mode = 'all', dailyKey }: UseLeaderboardOptions = {}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    if (mode === 'daily' && dailyKey) {
      const { data } = await supabase
        .from('geo_scores')
        .select('user_id, score')
        .eq('run_mode', 'daily')
        .eq('daily_key', dailyKey)
        .limit(1000)

      const grouped = new Map<string, { total: number; games_played: number }>()
      for (const row of data ?? []) {
        const current = grouped.get(row.user_id) ?? { total: 0, games_played: 0 }
        current.total += row.score
        current.games_played += 1
        grouped.set(row.user_id, current)
      }

      const dailyEntries = Array.from(grouped.entries())
        .map(([user_id, value]) => ({
          user_id,
          total: value.total,
          games_played: value.games_played,
          avg_score: Math.round(value.total / value.games_played),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 100)

      setEntries(dailyEntries)
    } else {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(100)

      setEntries(data ?? [])
    }
    setLoading(false)
  }, [mode, dailyKey])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { entries, loading, refresh: fetch }
}
