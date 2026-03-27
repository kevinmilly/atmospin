import { useNavigate } from 'react-router-dom'
import { Globe, Trophy, Compass } from 'lucide-react'

export function HomeView() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-indigo-400" />
          <h1 className="text-4xl font-bold tracking-tight text-white">
            The Weave
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-sm">
          Navigate time and space. Hunt the moment that shaped the world.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/hunt')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <Compass className="w-5 h-5" />
          Start Hunt
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <Trophy className="w-5 h-5" />
          Leaderboard
        </button>
      </div>

      <p className="text-slate-600 text-xs">
        Spin the globe. Set the era. Pin the moment.
      </p>
    </div>
  )
}
