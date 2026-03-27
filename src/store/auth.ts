import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  setSession: (s: Session | null) => void
  loading: boolean
  setLoading: (l: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (s) => set({ session: s }),
  loading: true,
  setLoading: (l) => set({ loading: l }),
}))
