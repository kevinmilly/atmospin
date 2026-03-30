import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Download,
  Globe,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { DifficultySelector } from '@/components/ui/DifficultySelector'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { XPBar } from '@/components/ui/XPBar'
import { useAuth } from '@/hooks/useAuth'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useOffline } from '@/hooks/useOffline'
import { getDailyKey } from '@/lib/daily'
import { music } from '@/lib/music'
import { useOnboardingStore } from '@/store/onboarding'

const HOOKS = [
  'The world is bigger than you think.',
  '3,000+ places. How many can you find?',
  'From Patagonia to Bhutan, dare to guess?',
  'Every wrong answer teaches you something.',
  'Geography you never knew you needed.',
  "Most people can't place half these landmarks.",
]

export function HomeView() {
  const navigate = useNavigate()
  const { isInstallable, install } = useInstallPrompt()
  const isOffline = useOffline()
  const { isAuthenticated, user, signOut } = useAuth()
  const homeIntroSeen = useOnboardingStore(s => s.homeIntroSeen)
  const markHomeIntroSeen = useOnboardingStore(s => s.markHomeIntroSeen)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [muted, setMuted] = useState(() => music.isMuted)
  const [hookIndex, setHookIndex] = useState(0)

  function toggleMusic() {
    const nowMuted = music.toggleMute()
    setMuted(nowMuted)
    if (!nowMuted) music.startTheme()
  }

  function goTo(path: string) {
    markHomeIntroSeen()
    music.stopTheme()
    navigate(path)
  }

  useEffect(() => {
    music.startTheme()
    return () => music.stopTheme()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setHookIndex(i => (i + 1) % HOOKS.length), 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-full relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-70">
        <GlobeCanvas interactive={false} autoRotate difficulty={4} />
      </div>

      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.15),transparent_40%),linear-gradient(to_bottom,rgba(2,6,23,0.58),rgba(2,6,23,0.26),rgba(2,6,23,0.88))] pointer-events-none" />

      <button
        onClick={toggleMusic}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {isOffline && (
        <div className="absolute top-4 left-4 right-16 z-20 bg-amber-900/60 border border-amber-700 rounded-lg px-3 py-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-200">Offline, playing with cached content</span>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">
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
          {!homeIntroSeen && (
            <div className="w-full rounded-3xl border border-indigo-600/40 bg-slate-950/65 backdrop-blur-md p-5 space-y-4 shadow-[0_0_32px_rgba(79,70,229,0.18)]">
              <div className="space-y-2 text-center">
                <p className="text-[11px] uppercase tracking-[0.24em] text-indigo-300 font-semibold">Start Here</p>
                <h1 className="text-2xl font-bold text-white leading-tight">Play one round and the game teaches itself.</h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Read a clue, spin the globe, place your pin, and see how close you were.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 px-2 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">1</p>
                  <p className="text-xs font-semibold text-white mt-1">Read</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 px-2 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">2</p>
                  <p className="text-xs font-semibold text-white mt-1">Pin</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 px-2 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">3</p>
                  <p className="text-xs font-semibold text-white mt-1">Chase</p>
                </div>
              </div>

              <button
                onClick={() => goTo('/globe-spin?coach=1')}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 transition-colors"
              >
                Play Your First Round
              </button>

              <button
                onClick={() => setShowOnboarding(true)}
                className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                See the full walkthrough
              </button>
            </div>
          )}

          <XPBar />

          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => goTo('/globe-spin')}
              className="flex flex-col items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800/70 active:scale-95 border border-emerald-700/60 backdrop-blur-sm text-white font-bold py-5 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <MapPin className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-bold">Globe Spin</span>
              <span className="text-[10px] text-emerald-300/70 text-center leading-tight">Guess the location,<br />score points</span>
            </button>
            <button
              onClick={() => goTo('/learn')}
              className="flex flex-col items-center gap-2 bg-indigo-900/60 hover:bg-indigo-800/70 active:scale-95 border border-indigo-700/60 backdrop-blur-sm text-white font-bold py-5 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <Globe className="w-6 h-6 text-indigo-400" />
              <span className="text-sm font-bold">Learn</span>
              <span className="text-[10px] text-indigo-300/70 text-center leading-tight">Discover places,<br />earn XP</span>
            </button>
          </div>

          {/* Difficulty — near the play buttons where it's relevant */}
          <DifficultySelector />

          {/* Secondary modes — slimmer, less visual weight */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => goTo('/globe-spin?mode=sprint')}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/60 px-3 py-2.5 text-left text-white transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Timer className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold">3-Round Sprint</span>
                  <span className="text-[10px] text-slate-500 ml-2">Fast run · big finish</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => goTo('/globe-spin?mode=daily')}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/60 px-3 py-2.5 text-left text-white transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold">Daily Challenge</span>
                  <span className="text-[10px] text-slate-500 ml-2">{getDailyKey()}</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>
          </div>

          {/* Footer links — all utility nav in one row */}
          <div className="flex items-center gap-3 flex-wrap justify-center pt-1">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Scores
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Progress
            </button>
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
