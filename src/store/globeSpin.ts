import { create } from 'zustand'
import type { GlobePoint } from '@/types'
export interface GeoChallenge {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  continent?: string
  subregion?: string
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
}

export type SpinPhase = 'loading' | 'prompt' | 'hunting' | 'submitted' | 'result' | 'summary'
export type SpinRunMode = 'quick' | 'sprint' | 'daily'

export interface SpinScoreResult {
  distanceKm: number
  distanceScore: number
  hintsUsed: number
  speedBonus: number
  totalScore: number
}

export interface SessionRoundSummary {
  challengeId: string
  challengeName: string
  continent: string
  distanceKm: number
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

  runMode: SpinRunMode
  maxRounds: number | null
  dailyKey: string | null
  configureRun: (mode: SpinRunMode) => void

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
  sessionRounds: SessionRoundSummary[]
  addRoundResult: (round: SessionRoundSummary) => void
  previousRound: SessionRoundSummary | null
  bestDistanceThisSession: number | null

  // Timer
  timeRemaining: number | null
  startTimer: (seconds: number) => void
  tickTimer: () => void
  stopTimer: () => void

  // Prefetched next challenge (eliminates round-transition lag)
  pendingChallenge: GeoChallenge | null
  setPendingChallenge: (c: GeoChallenge | null) => void

  resetSession: () => void
  reset: () => void
}

export const useGlobeSpinStore = create<GlobeSpinState>((set) => ({
  phase: 'loading',
  setPhase: (p) => set({ phase: p }),

  runMode: 'quick',
  maxRounds: null,
  dailyKey: null,
  configureRun: (mode) => set({
    runMode: mode,
    maxRounds: mode === 'quick' ? null : 3,
    dailyKey: mode === 'daily' ? new Date().toLocaleDateString('en-CA') : null,
  }),

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
  sessionRounds: [],
  previousRound: null,
  bestDistanceThisSession: null,
  addRoundResult: (round) => set((s) => ({
    roundsPlayed: s.roundsPlayed + 1,
    sessionScore: s.sessionScore + round.totalScore,
    sessionRounds: [...s.sessionRounds, round],
    previousRound: s.sessionRounds.at(-1) ?? null,
    bestDistanceThisSession: s.bestDistanceThisSession === null
      ? round.distanceKm
      : Math.min(s.bestDistanceThisSession, round.distanceKm),
  })),

  timeRemaining: null,
  startTimer: (seconds) => set({ timeRemaining: seconds }),
  tickTimer: () => set((s) => ({
    timeRemaining: s.timeRemaining !== null ? Math.max(0, s.timeRemaining - 1) : null,
  })),
  stopTimer: () => set({ timeRemaining: null }),

  pendingChallenge: null,
  setPendingChallenge: (c) => set({ pendingChallenge: c }),

  resetSession: () => set((s) => ({
    phase: 'loading',
    challenge: null,
    playerPin: null,
    hintsRevealed: 0,
    scoreResult: null,
    roundsPlayed: 0,
    sessionScore: 0,
    sessionRounds: [],
    previousRound: null,
    bestDistanceThisSession: null,
    timeRemaining: null,
    pendingChallenge: null,
    runMode: s.runMode,
    maxRounds: s.maxRounds,
    dailyKey: s.dailyKey,
  })),

  reset: () => set({
    phase: 'loading',
    challenge: null,
    playerPin: null,
    hintsRevealed: 0,
    scoreResult: null,
    timeRemaining: null,
  }),
}))
