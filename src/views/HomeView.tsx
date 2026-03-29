import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, MapPin, Download, LogIn, LogOut, WifiOff, BookOpen, LayoutDashboard, Volume2, VolumeX, Globe } from 'lucide-react'
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
  const [muted, setMuted] = useState(() => music.isMuted)

  function toggleMusic() {
    const nowMuted = music.toggleMute()
    setMuted(nowMuted)
    if (!nowMuted) music.startTheme()
  }

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

      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

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

          {/* Mode cards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => { music.stopTheme(); navigate('/globe-spin') }}
              className="flex flex-col items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800/70 active:scale-95 border border-emerald-700/60 backdrop-blur-sm text-white font-bold py-5 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <MapPin className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-bold">Globe Spin</span>
              <span className="text-[10px] text-emerald-300/70 text-center leading-tight">Guess the location,<br/>score points</span>
            </button>
            <button
              onClick={() => { music.stopTheme(); navigate('/learn') }}
              className="flex flex-col items-center gap-2 bg-indigo-900/60 hover:bg-indigo-800/70 active:scale-95 border border-indigo-700/60 backdrop-blur-sm text-white font-bold py-5 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <Globe className="w-6 h-6 text-indigo-400" />
              <span className="text-sm font-bold">Learn</span>
              <span className="text-[10px] text-indigo-300/70 text-center leading-tight">Discover places,<br/>earn XP</span>
            </button>
          </div>

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
