import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  homeIntroSeen: boolean
  gameCoachSeen: boolean
  markHomeIntroSeen: () => void
  markGameCoachSeen: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      homeIntroSeen: false,
      gameCoachSeen: false,
      markHomeIntroSeen: () => set({ homeIntroSeen: true }),
      markGameCoachSeen: () => set({ gameCoachSeen: true }),
    }),
    { name: 'atmospin-onboarding' },
  ),
)
