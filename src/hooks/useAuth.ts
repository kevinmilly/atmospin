import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const { session, setSession, loading, setLoading } = useAuthStore()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => { listener.subscription.unsubscribe() }
  }, [setSession, setLoading])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return {
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
  }
}
