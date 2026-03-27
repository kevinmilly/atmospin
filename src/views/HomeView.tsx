import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Compass, MapPin, Download, LogIn, LogOut, WifiOff } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useOffline } from '@/hooks/useOffline'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

export function HomeView() {
  const navigate = useNavigate()
  const { isInstallable, install } = useInstallPrompt()
  const isOffline = useOffline()
  const { isAuthenticated, user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-6 relative overflow-hidden">
      {/* Offline banner */}
      {isOffline && (
        <div className="absolute top-4 left-4 right-4 bg-amber-900/50 border border-amber-700 rounded-lg px-3 py-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-200">Offline — playing with cached content</span>
        </div>
      )}

      {/* Logo splash */}
      <div className="flex flex-col items-center gap-2">
        <img
          src="/logo-title.png"
          alt="Atmospin — Locate the moment. Tune the world."
          className="w-64 max-w-[80vw] object-contain drop-shadow-[0_0_32px_rgba(56,189,248,0.4)]"
        />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/hunt')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <Compass className="w-5 h-5" />
          Start Hunt
        </button>
        <button
          onClick={() => navigate('/globe-spin')}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Globe Spin
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-500 text-slate-200 font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <Trophy className="w-5 h-5" />
          Leaderboard
        </button>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-3">
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        )}
        {isAuthenticated ? (
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {user?.email?.split('@')[0] ?? 'Sign Out'}
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
