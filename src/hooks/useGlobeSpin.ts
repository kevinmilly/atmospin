import { useCallback, useRef } from 'react'
import { useGlobeSpinStore } from '@/store/globeSpin'
import { useGlobeStore } from '@/store/globe'
import { haversineDistance, calcDistanceScore, calcTotalScore, calcSpeedBonus } from '@/engine/huntEngine'
import { haptics } from '@/lib/haptics'
import { useSettingsStore, DIFFICULTY_CONFIG } from '@/store/settings'
import { TIMER_SECONDS } from '@/store/globeSpin'
import { useAchievementsStore } from '@/store/achievements'
import { getStreakMultiplier } from '@/store/xp'
import { fetchRandomPlace } from '@/lib/places'
import { submitGeoScore } from '@/lib/scores'
import { useAuthStore } from '@/store/auth'
import type { GlobePoint } from '@/types'
import { estimateContinent } from '@/lib/geo'
import type { FetchPlaceOptions } from '@/lib/places'
import { getDailyChallengeSet } from '@/lib/daily'

export function useGlobeSpin() {
  const {
    phase, setPhase,
    challenge, setChallenge,
    playerPin, setPlayerPin,
    hintsRevealed, revealHint,
    scoreResult, setScoreResult,
    roundsPlayed, sessionScore, addRoundResult,
    maxRounds, sessionRounds, previousRound, bestDistanceThisSession, dailyKey,
    timeRemaining, stopTimer,
    pendingChallenge, setPendingChallenge,
    runMode,
    reset,
  } = useGlobeSpinStore()

  // Use a ref so loadChallenge can read pendingChallenge without it being a dep
  const pendingChallengeRef = useRef(pendingChallenge)
  pendingChallengeRef.current = pendingChallenge

  const setGlobePin = useGlobeStore(s => s.setPin)
  const difficulty = useSettingsStore(s => s.difficulty)
  const difficultyMultiplier = DIFFICULTY_CONFIG[difficulty].multiplier
  const currentStreak = useAchievementsStore(s => s.stats.currentStreak)
  const streakMultiplier = getStreakMultiplier(currentStreak)
  const session = useAuthStore(s => s.session)

  const loadChallenge = useCallback(async (options: FetchPlaceOptions = {}) => {
    reset()
    setGlobePin(null)

    if (runMode === 'daily' && dailyKey) {
      const dailySet = getDailyChallengeSet(maxRounds ?? 3, dailyKey)
      const nextDaily = dailySet[roundsPlayed]
      if (nextDaily) {
        setChallenge(nextDaily)
        setPhase('prompt')
        return
      }
    }

    // Use prefetched challenge if available for instant round start
    const pending = pendingChallengeRef.current
    if (pending && (!options.continent || pending.continent === options.continent) && !options.excludeIds?.includes(pending.id)) {
      setChallenge(pending)
      setPendingChallenge(null)
      setPhase('prompt')
      return
    }
    try {
      const place = await fetchRandomPlace({ difficulty, ...options })
      setChallenge(place)
    } catch {
      // fetchRandomPlace has its own fallback; this should never throw
    }
    setPhase('prompt')
  }, [reset, setGlobePin, setChallenge, setPhase, setPendingChallenge, difficulty, runMode, dailyKey, maxRounds, roundsPlayed])

  const startHunting = useCallback(() => {
    setPhase('hunting')
  }, [setPhase])

  const placePin = useCallback((point: GlobePoint) => {
    if (phase !== 'hunting') return
    setPlayerPin(point)
    setGlobePin(point)
    haptics.pin()
  }, [phase, setPlayerPin, setGlobePin])

  const submitAnswer = useCallback(() => {
    if (!challenge || !playerPin) return

    haptics.lockIn()
    setPhase('submitted')

    const target: GlobePoint = {
      lat: challenge.lat,
      lng: challenge.lng,
    }

    stopTimer()

    const distanceKm = Math.round(haversineDistance(playerPin, target))
    const distanceScore = calcDistanceScore(distanceKm)
    const rawTotal = calcTotalScore(distanceScore, 0, hintsRevealed)
    const totalSeconds = TIMER_SECONDS[difficulty] ?? 0
    const speedBonus = totalSeconds > 0 && timeRemaining !== null
      ? calcSpeedBonus(timeRemaining, totalSeconds)
      : 0
    const totalScore = Math.round((rawTotal + speedBonus) * difficultyMultiplier * streakMultiplier)
    const continent = challenge.continent ?? estimateContinent(challenge.lat, challenge.lng)

    const result = { distanceKm, distanceScore, hintsUsed: hintsRevealed, speedBonus, totalScore }
    setScoreResult(result)
    addRoundResult({
      challengeId: challenge.id,
      challengeName: challenge.name,
      continent,
      distanceKm,
      totalScore,
    })

    // Persist score to Supabase if authenticated (fire-and-forget)
    if (session?.user) {
      submitGeoScore({
        userId: session.user.id,
        placeId: challenge.id,
        score: totalScore,
        distanceKm,
        difficulty,
        runMode,
        dailyKey,
      })
    }

    setTimeout(() => {
      if (totalScore > 700) haptics.correct()
      else if (totalScore < 200) haptics.incorrect()
      const nextRoundsPlayed = roundsPlayed + 1
      if (maxRounds !== null && nextRoundsPlayed >= maxRounds) setPhase('summary')
      else setPhase('result')
      // Prefetch next challenge in background while result is showing
      if (runMode !== 'daily') {
        fetchRandomPlace({ difficulty }).then(setPendingChallenge).catch(() => {})
      }
    }, 600)
  }, [challenge, playerPin, hintsRevealed, setPhase, setScoreResult, addRoundResult, session, difficulty, difficultyMultiplier, streakMultiplier, timeRemaining, stopTimer, setPendingChallenge, roundsPlayed, maxRounds, runMode, dailyKey])

  const useHint = useCallback(() => {
    if (phase !== 'hunting') return
    revealHint()
  }, [phase, revealHint])

  return {
    phase, challenge, playerPin, hintsRevealed,
    scoreResult, roundsPlayed, sessionScore,
    runMode, maxRounds, sessionRounds, previousRound, bestDistanceThisSession, dailyKey,
    timeRemaining,
    loadChallenge, startHunting, placePin,
    submitAnswer, useHint,
  }
}
