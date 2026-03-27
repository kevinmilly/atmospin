import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, RefreshCw, LogIn } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

export function LeaderboardView() {
  const navigate = useNavigate()
  const { entries, loading, refresh } = useLeaderboard()
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
                ? 'Play a hunt to get on the board!'
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
