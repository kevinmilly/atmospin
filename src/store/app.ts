import { create } from 'zustand'

interface AppState {
  updateAvailable: boolean
  setUpdateAvailable: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  updateAvailable: false,
  setUpdateAvailable: (v) => set({ updateAvailable: v }),
}))
