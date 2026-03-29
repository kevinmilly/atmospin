import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, MapPin, Download, LogIn, LogOut, WifiOff, BookOpen, LayoutDashboard, Volume2, VolumeX, Globe, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useOffline } from '@/hooks/useOffline'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { DifficultySelector } from '@/components/ui/DifficultySelector'
import { XPBar } from '@/components/ui/XPBar'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { music } from '@/lib/music'
import { fetchRandomPlace } from '@/lib/places'

const ONBOARDING_KEY = 'atmospin_onboarded'

const HOOKS = [
  "The world is bigger than you think.",
  "3,000+ places. How many can you find?",
  "From Patagonia to Bhutan — dare to guess?",
  "Every wrong answer teaches you something.",
  "Geography you never knew you needed.",
  "48% of people can't find Norway on a globe.",
]

export function HomeView() {
  const navigate = useNavigate()
  const { isInstallable, install } = useInstallPrompt()
  const isOffline = useOffline()
  const { isAuthenticated, user, signOut } = useAuth()

  const isFirstVisit = !localStorage.getItem(ONBOARDING_KEY)
  const [showSplash, setShowSplash] = useState(isFirstVisit)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [muted, setMuted] = useState(() => music.isMuted)
  const [hookIndex, setHookIndex] = useState(0)
  const [teaser, setTeaser] = useState<{ prompt: string } | null>(null)

  function toggleMusic() {
    const nowMuted = music.toggleMute()
    setMuted(nowMuted)
    if (!nowMuted) music.startTheme()
  }

  function dismissSplash() {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setShowSplash(false)
  }

  useEffect(() => { music.startTheme(); return () => music.stopTheme() }, [])

  // Auto-dismiss splash after 4s
  useEffect(() => {
    if (!showSplash) return
    const id = setTimeout(dismissSplash, 4000)
    return () => clearTimeout(id)
  }, [showSplash])

  // Rotate hooks every 3.5s
  useEffect(() => {
    const id = setInterval(() => setHookIndex(i => (i + 1) % HOOKS.length), 3500)
    return () => clearInterval(id)
  }, [])

  // Load a teaser challenge
  useEffect(() => {
    fetchRandomPlace().then(p => setTeaser({ prompt: p.prompt })).catch(() => null)
  }, [])

  return (
    <div className="h-full relative overflow-hidden">
      {/* Auto-rotating globe background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <GlobeCanvas interactive={false} autoRotate difficulty={4} />
      </div>

      {/* Dark gradient overlay */}
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
        <div className="absolute top-4 left-4 right-16 z-20 bg-amber-900/60 border border-amber-700 rounded-lg px-3 py-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-200">Offline — playing with cached content</span>
        </div>
      )}

      {/* ── First-visit splash ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="absolute inset-0 z-40 flex flex-col items-center justify-center cursor-pointer"
            onClick={dismissSplash}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
          >
            {/* Deep overlay so text pops */}
            <div className="absolute inset-0 bg-slate-950/70" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
              {/* Staggered headline */}
              <div className="space-y-1">
                {['The world is', 'bigger than', 'you think.'].map((line, i) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.25, duration: 0.6, ease: 'easeOut' }}
                    className={`font-bold leading-tight tracking-tight text-white ${
                      i === 2
                        ? 'text-4xl drop-shadow-[0_0_30px_rgba(99,102,241,0.8)] text-indigo-200'
                        : 'text-3xl text-slate-300'
                    }`}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="text-sm text-slate-400"
              >
                Tap anywhere to explore →
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main UI ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">

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

        {/* Rotating hook tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-6 flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={hookIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-xs text-slate-400 text-center italic px-4"
            >
              {HOOKS[hookIndex]}
            </motion.p>
          </AnimatePresence>
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
              <span className="text-[10px] text-emerald-300/70 text-center leading-tight">Guess the location,<br />score points</span>
            </button>
            <button
              onClick={() => { music.stopTheme(); navigate('/learn') }}
              className="flex flex-col items-center gap-2 bg-indigo-900/60 hover:bg-indigo-800/70 active:scale-95 border border-indigo-700/60 backdrop-blur-sm text-white font-bold py-5 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <Globe className="w-6 h-6 text-indigo-400" />
              <span className="text-sm font-bold">Learn</span>
              <span className="text-[10px] text-indigo-300/70 text-center leading-tight">Discover places,<br />earn XP</span>
            </button>
          </div>

          {/* Social proof */}
          <p className="text-[10px] text-slate-500 text-center">
            🌍 3,000+ places across all 7 continents
          </p>

          {/* Live challenge teaser */}
          <AnimatePresence>
            {teaser && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onClick={() => { music.stopTheme(); navigate('/globe-spin') }}
                className="w-full text-left bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/50 backdrop-blur-sm rounded-xl p-4 group transition-colors"
              >
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wide mb-1.5">
                  🗺️ Can you find this place?
                </p>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  "{teaser.prompt}"
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  Play to find out <ArrowRight className="w-3 h-3" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>

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
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  )
}
