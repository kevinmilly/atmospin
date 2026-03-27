import { useCallback } from 'react'
import { useHuntStore } from '@/store/hunt'
import { useGlobeStore } from '@/store/globe'
import { calculateScore } from '@/engine/huntEngine'
import { haptics } from '@/lib/haptics'
import { seedChallenges } from '@/data/seed-challenges'
import type { GlobePoint } from '@/types'

let lastChallengeIndex = -1

export function useHunt() {
  const {
    phase, setPhase,
    challenge, setChallenge,
    playerPin, setPlayerPin,
    playerYear, setPlayerYear,
    hintsRevealed, revealHint,
    scoreResult, setScoreResult,
    reset,
  } = useHuntStore()

  const setGlobePin = useGlobeStore(s => s.setPin)

  /** Load a random challenge (from local seed data for now) */
  const loadChallenge = useCallback(() => {
    reset()
    setGlobePin(null)

    // Pick a random challenge, avoiding repeating the last one
    let idx: number
    do {
      idx = Math.floor(Math.random() * seedChallenges.length)
    } while (idx === lastChallengeIndex && seedChallenges.length > 1)
    lastChallengeIndex = idx

    setChallenge(seedChallenges[idx])
    setPhase('prompt')
  }, [reset, setGlobePin, setChallenge, setPhase])

  /** Player taps "Start Hunting" from the prompt screen */
  const startHunting = useCallback(() => {
    setPhase('hunting')
  }, [setPhase])

  /** Player places a pin on the globe */
  const placePin = useCallback((point: GlobePoint) => {
    if (phase !== 'hunting') return
    setPlayerPin(point)
    setGlobePin(point)
    haptics.pin()
  }, [phase, setPlayerPin, setGlobePin])

  /** Player submits their answer */
  const submitAnswer = useCallback(() => {
    if (!challenge || !playerPin) return

    haptics.lockIn()
    setPhase('submitted')

    const target: GlobePoint = {
      lat: challenge.location.lat,
      lng: challenge.location.lng,
    }

    const result = calculateScore(
      playerPin,
      playerYear,
      target,
      challenge.event.year_start,
      hintsRevealed,
    )

    setScoreResult(result)

    // Brief delay before showing result
    setTimeout(() => {
      if (result.totalScore > 800) {
        haptics.correct()
      } else if (result.totalScore < 200) {
        haptics.incorrect()
      }
      setPhase('result')
    }, 600)
  }, [challenge, playerPin, playerYear, hintsRevealed, setPhase, setScoreResult])

  /** Reveal the next hint */
  const useHint = useCallback(() => {
    if (phase !== 'hunting') return
    revealHint()
  }, [phase, revealHint])

  return {
    phase,
    challenge,
    playerPin,
    playerYear,
    setPlayerYear,
    hintsRevealed,
    scoreResult,
    loadChallenge,
    startHunting,
    placePin,
    submitAnswer,
    useHint,
    reset,
  }
}
