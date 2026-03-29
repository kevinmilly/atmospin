import { create } from 'zustand'
import type { GlobePoint } from '@/types'
export interface GeoChallenge {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  category: string
  difficulty: number
  prompt: string
  hints: string[]
  fun_fact: string
  // Learn Mode (populated when drawn from Supabase)
  learn_fact?: string
  quiz_question?: string
  quiz_answers?: string[]
  quiz_correct?: number
  // Contextual clues
  climate?: string
  region_context?: string
}

export type SpinPhase = 'loading' | 'prompt' | 'hunting' | 'submitted' | 'result'

export interface SpinScoreResult {
  distanceKm: number
  distanceScore: number
  hintsUsed: number
  speedBonus: number
  totalScore: number
}

export const TIMER_SECONDS: Record<1 | 2 | 3 | 4, number | null> = {
  1: null,
  2: 90,
  3: 60,
  4: 45,
}

interface GlobeSpinState {
  phase: SpinPhase
  setPhase: (p: SpinPhase) => void

  challenge: GeoChallenge | null
  setChallenge: (c: GeoChallenge | null) => void

  playerPin: GlobePoint | null
  setPlayerPin: (p: GlobePoint | null) => void

  hintsRevealed: number
  revealHint: () => void

  scoreResult: SpinScoreResult | null
  setScoreResult: (s: SpinScoreResult | null) => void

  // Running totals for the session
  roundsPlayed: number
  sessionScore: number
  addRoundScore: (score: number) => void

  // Timer
  timeRemaining: number | null
  startTimer: (seconds: number) => void
  tickTimer: () => void
  stopTimer: () => void

  // Prefetched next challenge (eliminates round-transition lag)
  pendingChallenge: GeoChallenge | null
  setPendingChallenge: (c: GeoChallenge | null) => void

  reset: () => void
}

export const useGlobeSpinStore = create<GlobeSpinState>((set) => ({
  phase: 'loading',
  setPhase: (p) => set({ phase: p }),

  challenge: null,
  setChallenge: (c) => set({ challenge: c }),

  playerPin: null,
  setPlayerPin: (p) => set({ playerPin: p }),

  hintsRevealed: 0,
  revealHint: () => set((s) => ({
    hintsRevealed: Math.min(s.hintsRevealed + 1, s.challenge?.hints.length ?? 3),
  })),

  scoreResult: null,
  setScoreResult: (s) => set({ scoreResult: s }),

  roundsPlayed: 0,
  sessionScore: 0,
  addRoundScore: (score) => set((s) => ({
    roundsPlayed: s.roundsPlayed + 1,
    sessionScore: s.sessionScore + score,
  })),

  timeRemaining: null,
  startTimer: (seconds) => set({ timeRemaining: seconds }),
  tickTimer: () => set((s) => ({
    timeRemaining: s.timeRemaining !== null ? Math.max(0, s.timeRemaining - 1) : null,
  })),
  stopTimer: () => set({ timeRemaining: null }),

  pendingChallenge: null,
  setPendingChallenge: (c) => set({ pendingChallenge: c }),

  reset: () => set({
    phase: 'loading',
    challenge: null,
    playerPin: null,
    hintsRevealed: 0,
    scoreResult: null,
    timeRemaining: null,
  }),
}))
