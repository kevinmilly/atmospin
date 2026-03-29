import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, RefreshCw, LogIn } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'
import { getDailyKey } from '@/lib/daily'

export function LeaderboardView() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | 'daily'>('all')
  const dailyKey = getDailyKey()
  const { entries, loading, refresh } = useLeaderboard({ mode: tab, dailyKey })
  const { isAuthenticated, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/80 p-1">
          {(['all', 'daily'] as const).map(option => (
            <button
              key={option}
              onClick={() => setTab(option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === option
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {option === 'all' ? 'All-Time' : `Daily · ${dailyKey}`}
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-indigo-950/60 border border-indigo-700/50 flex items-start gap-3">
          <LogIn className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-indigo-200 font-medium">Sign in to track your scores</p>
            <p className="text-xs text-indigo-400 mt-0.5">Your rounds won't be saved until you sign in. You can still see other players below.</p>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="shrink-0 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm gap-2">
            <Trophy className="w-10 h-10 text-slate-700" />
            <p>No scores yet</p>
            <p className="text-xs text-slate-600">
              {isAuthenticated
                ? tab === 'daily' ? 'Play today\'s daily to get on the board!' : 'Play a hunt to get on the board!'
                : 'Sign in and play to appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {entries.map((entry, i) => {
              const isMe = user && entry.user_id === user.id
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 px-4 py-3 ${isMe ? 'bg-indigo-950/30' : ''}`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${
                    i === 0 ? 'text-amber-400' :
                    i === 1 ? 'text-slate-300' :
                    i === 2 ? 'text-amber-700' :
                    'text-slate-500'
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                      {isMe ? 'You' : `Player ${entry.user_id.slice(0, 6)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.games_played} games &middot; avg {entry.avg_score}
                    </p>
                  </div>
                  <span className="font-bold font-mono text-white">{entry.total}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
