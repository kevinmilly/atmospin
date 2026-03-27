import { create } from 'zustand'
import type { HuntChallenge, HistoricalEvent, Location, GlobePoint } from '@/types'

export type HuntPhase = 'loading' | 'prompt' | 'hunting' | 'submitted' | 'result'

export interface ScoreResult {
  distanceKm: number
  yearDiff: number
  distanceScore: number
  timeScore: number
  hintsUsed: number
  totalScore: number
}

type FullChallenge = HuntChallenge & { event: HistoricalEvent; location: Location }

interface HuntState {
  phase: HuntPhase
  setPhase: (p: HuntPhase) => void

  challenge: FullChallenge | null
  setChallenge: (c: FullChallenge | null) => void

  // Player inputs
  playerPin: GlobePoint | null
  setPlayerPin: (p: GlobePoint | null) => void
  playerYear: number
  setPlayerYear: (y: number) => void

  // Hints
  hintsRevealed: number
  revealHint: () => void

  // Score result
  scoreResult: ScoreResult | null
  setScoreResult: (s: ScoreResult | null) => void

  // Reset for next round
  reset: () => void
}

export const useHuntStore = create<HuntState>((set) => ({
  phase: 'loading',
  setPhase: (p) => set({ phase: p }),

  challenge: null,
  setChallenge: (c) => set({ challenge: c }),

  playerPin: null,
  setPlayerPin: (p) => set({ playerPin: p }),
  playerYear: 2000,
  setPlayerYear: (y) => set({ playerYear: y }),

  hintsRevealed: 0,
  revealHint: () => set((s) => ({
    hintsRevealed: Math.min(s.hintsRevealed + 1, s.challenge?.hints.length ?? 3),
  })),

  scoreResult: null,
  setScoreResult: (s) => set({ scoreResult: s }),

  reset: () => set({
    phase: 'loading',
    challenge: null,
    playerPin: null,
    playerYear: 2000,
    hintsRevealed: 0,
    scoreResult: null,
  }),
}))
