import { Trophy, MapPin, Lightbulb, ArrowRight } from 'lucide-react'
import type { SpinScoreResult } from '@/store/globeSpin'
import type { GeoChallenge } from '@/data/seed-geography'

interface SpinResultOverlayProps {
  scoreResult: SpinScoreResult
  challenge: GeoChallenge
  roundsPlayed: number
  sessionScore: number
  onNextRound: () => void
}

function getRating(score: number): { label: string; color: string } {
  if (score >= 900) return { label: 'Bullseye!', color: 'text-amber-400' }
  if (score >= 600) return { label: 'Great!', color: 'text-emerald-400' }
  if (score >= 300) return { label: 'Good', color: 'text-blue-400' }
  return { label: 'Keep Exploring', color: 'text-slate-400' }
}

export function SpinResultOverlay({ scoreResult, challenge, roundsPlayed, sessionScore, onNextRound }: SpinResultOverlayProps) {
  const rating = getRating(scoreResult.totalScore)

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 max-w-sm w-full space-y-5 animate-slide-up">
        <div className="text-center">
          <Trophy className={`w-8 h-8 mx-auto mb-2 ${rating.color}`} />
          <p className={`text-xl font-bold ${rating.color}`}>{rating.label}</p>
          <p className="text-3xl font-bold text-white mt-1">{scoreResult.totalScore}</p>
          <p className="text-xs text-slate-400">points</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                Distance: {scoreResult.distanceKm} km off
              </div>
              <span className="font-mono text-white">{scoreResult.distanceScore}/1000</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (scoreResult.distanceScore / 1000) * 100)}%` }}
              />
            </div>
          </div>

          {scoreResult.hintsUsed > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-amber-400">
                <Lightbulb className="w-4 h-4" />
                Hints used: {scoreResult.hintsUsed}
              </div>
              <span className="font-mono text-amber-400">-{scoreResult.hintsUsed * 100}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 space-y-1">
          <p className="text-xs text-slate-400">Answer</p>
          <p className="text-sm font-semibold text-white">
            {challenge.location.name}, {challenge.location.country}
          </p>
          {challenge.fun_fact && (
            <p className="text-xs text-indigo-300 mt-2 italic">{challenge.fun_fact}</p>
          )}
        </div>

        {/* Session stats */}
        <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>Round {roundsPlayed}</span>
          <span>Session total: {sessionScore}</span>
        </div>

        <button
          onClick={onNextRound}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
        >
          Next Round
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
