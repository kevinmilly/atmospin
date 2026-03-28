import { useCallback } from 'react'
import { useGlobeSpinStore } from '@/store/globeSpin'
import { useGlobeStore } from '@/store/globe'
import { haversineDistance, calcDistanceScore, calcTotalScore } from '@/engine/huntEngine'
import { haptics } from '@/lib/haptics'
import { useSettingsStore, DIFFICULTY_CONFIG } from '@/store/settings'
import geoPlaces from '@/data/geo-places.json'
import type { GlobePoint } from '@/types'

let lastIndex = -1

export function useGlobeSpin() {
  const {
    phase, setPhase,
    challenge, setChallenge,
    playerPin, setPlayerPin,
    hintsRevealed, revealHint,
    scoreResult, setScoreResult,
    roundsPlayed, sessionScore, addRoundScore,
    reset,
  } = useGlobeSpinStore()

  const setGlobePin = useGlobeStore(s => s.setPin)
  const difficulty = useSettingsStore(s => s.difficulty)
  const multiplier = DIFFICULTY_CONFIG[difficulty].multiplier

  const loadChallenge = useCallback(() => {
    reset()
    setGlobePin(null)

    let idx: number
    do {
      idx = Math.floor(Math.random() * geoPlaces.length)
    } while (idx === lastIndex && geoPlaces.length > 1)
    lastIndex = idx

    setChallenge(geoPlaces[idx])
    setPhase('prompt')
  }, [reset, setGlobePin, setChallenge, setPhase])

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

    const distanceKm = Math.round(haversineDistance(playerPin, target))
    const distanceScore = calcDistanceScore(distanceKm)
    const rawTotal = calcTotalScore(distanceScore, 0, hintsRevealed)
    const totalScore = Math.round(rawTotal * multiplier)

    const result = { distanceKm, distanceScore, hintsUsed: hintsRevealed, totalScore }
    setScoreResult(result)
    addRoundScore(totalScore)

    setTimeout(() => {
      if (totalScore > 700) haptics.correct()
      else if (totalScore < 200) haptics.incorrect()
      setPhase('result')
    }, 600)
  }, [challenge, playerPin, hintsRevealed, setPhase, setScoreResult, addRoundScore])

  const useHint = useCallback(() => {
    if (phase !== 'hunting') return
    revealHint()
  }, [phase, revealHint])

  return {
    phase, challenge, playerPin, hintsRevealed,
    scoreResult, roundsPlayed, sessionScore,
    loadChallenge, startHunting, placePin,
    submitAnswer, useHint,
  }
}
