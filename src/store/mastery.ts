import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ContinentMastery {
  continent: string
  roundsPlayed: number
  totalScore: number
  totalDistanceKm: number
  bestScore: number
  bestDistanceKm: number
}

interface MasteryState {
  continents: Record<string, ContinentMastery>
  recordRound: (input: { continent: string; score: number; distanceKm: number }) => void
}

const CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'] as const

function getEmptyMastery(continent: string): ContinentMastery {
  return {
    continent,
    roundsPlayed: 0,
    totalScore: 0,
    totalDistanceKm: 0,
    bestScore: 0,
    bestDistanceKm: Number.POSITIVE_INFINITY,
  }
}

export function getMasteryLevel(avgScore: number) {
  if (avgScore >= 800) return { label: 'Elite', tone: 'text-emerald-300', glow: 'from-emerald-500/25 to-emerald-900/20' }
  if (avgScore >= 600) return { label: 'Strong', tone: 'text-sky-300', glow: 'from-sky-500/25 to-sky-900/20' }
  if (avgScore >= 400) return { label: 'Growing', tone: 'text-amber-300', glow: 'from-amber-500/25 to-amber-900/20' }
  return { label: 'Early', tone: 'text-rose-300', glow: 'from-rose-500/25 to-rose-900/20' }
}

export function getMasteryEntries(continents: Record<string, ContinentMastery>) {
  return CONTINENTS.map(continent => continents[continent] ?? getEmptyMastery(continent))
}

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set) => ({
      continents: {},
      recordRound: ({ continent, score, distanceKm }) => set((state) => {
        const current = state.continents[continent] ?? getEmptyMastery(continent)
        return {
          continents: {
            ...state.continents,
            [continent]: {
              continent,
              roundsPlayed: current.roundsPlayed + 1,
              totalScore: current.totalScore + score,
              totalDistanceKm: current.totalDistanceKm + distanceKm,
              bestScore: Math.max(current.bestScore, score),
              bestDistanceKm: Math.min(current.bestDistanceKm, distanceKm),
            },
          },
        }
      }),
    }),
    { name: 'atmospin-mastery' },
  ),
)
