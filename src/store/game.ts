import { create } from 'zustand'

export type GameScreen = 'home' | 'hunt' | 'leaderboard'

interface GameState {
  screen: GameScreen
  setScreen: (s: GameScreen) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'home',
  setScreen: (s) => set({ screen: s }),
}))
