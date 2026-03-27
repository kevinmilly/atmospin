import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  // Supabase not configured — leaderboard and auth will be unavailable.
  // Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable.
}

export const supabase = url && key
  ? createClient(url, key)
  : null
