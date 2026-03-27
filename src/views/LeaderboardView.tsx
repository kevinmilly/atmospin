import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy } from 'lucide-react'

export function LeaderboardView() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Trophy className="w-16 h-16 text-slate-700" />
        <p className="text-sm">Leaderboard coming soon</p>
      </div>
    </div>
  )
}
