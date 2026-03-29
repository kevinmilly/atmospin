import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DifficultyTier = 1 | 2 | 3 | 4

export const DIFFICULTY_CONFIG = {
  1: { name: 'Easy', multiplier: 0.5, label: '0.5×', description: 'Country labels on globe' },
  2: { name: 'Medium', multiplier: 0.75, label: '0.75×', description: 'Continent labels only' },
  3: { name: 'Hard', multiplier: 0.9, label: '0.9×', description: 'Continent shading, no text' },
  4: { name: 'Expert', multiplier: 1.0, label: '1×', description: 'No labels at all' },
} as const satisfies Record<DifficultyTier, { name: string; multiplier: number; label: string; description: string }>

interface SettingsState {
  difficulty: DifficultyTier
  setDifficulty: (d: DifficultyTier) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      difficulty: 1,
      setDifficulty: (d) => set({ difficulty: d }),
    }),
    { name: 'atmospin-settings' },
  ),
)
