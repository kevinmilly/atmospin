import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, MapPin, Download, LogIn, LogOut, WifiOff, BookOpen, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useOffline } from '@/hooks/useOffline'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { DifficultySelector } from '@/components/ui/DifficultySelector'
import { XPBar } from '@/components/ui/XPBar'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { music } from '@/lib/music'

const ONBOARDING_KEY = 'atmospin_onboarded'

export function HomeView() {
  const navigate = useNavigate()
  const { isInstallable, install } = useInstallPrompt()
  const isOffline = useOffline()
  const { isAuthenticated, user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY))

  // Start theme on mount, clean up on unmount
  useEffect(() => {
    music.startTheme()
    return () => music.stopTheme()
  }, [])

  function closeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setShowOnboarding(false)
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Auto-rotating globe background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <GlobeCanvas interactive={false} autoRotate difficulty={4} />
      </div>

      {/* Dark gradient overlay so text is legible */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/80 pointer-events-none" />

      {/* Offline banner */}
      {isOffline && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-amber-900/60 border border-amber-700 rounded-lg px-3 py-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-200">Offline — playing with cached content</span>
        </div>
      )}

      {/* Centered UI card */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 p-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src="/logo-title.png"
            alt="Atmospin"
            className="w-56 max-w-[72vw] object-contain drop-shadow-[0_0_40px_rgba(56,189,248,0.5)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 w-full max-w-xs"
        >
          {/* XP bar */}
          <XPBar />

          {/* Primary Play button */}
          <button
            onClick={() => { music.stopTheme(); navigate('/globe-spin') }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-[0_0_24px_rgba(16,185,129,0.35)]"
          >
            <MapPin className="w-5 h-5" />
            Play
          </button>

          {/* Secondary buttons */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700/60 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              <Trophy className="w-4 h-4" />
              Scores
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700/60 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Progress
            </button>
          </div>

          {/* Difficulty */}
          <DifficultySelector />

          {/* Tertiary links */}
          <div className="flex items-center gap-4 flex-wrap justify-center pt-1">
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              How to Play
            </button>
            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            )}
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {user?.email?.split('@')[0] ?? 'Sign Out'}
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
    </div>
  )
}
