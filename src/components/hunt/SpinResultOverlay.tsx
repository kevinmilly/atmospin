import { MapPin, ArrowRight, Sparkles, Target, CircleX } from 'lucide-react'
import type { SpinScoreResult } from '@/store/globeSpin'
import type { GeoChallenge } from '@/data/seed-geography'

interface SpinResultOverlayProps {
  scoreResult: SpinScoreResult
  challenge: GeoChallenge
  roundsPlayed: number
  sessionScore: number
  onNextRound: () => void
}

function getRating(score: number): { label: string; color: string; bg: string; icon: typeof Sparkles } {
  if (score >= 900) return { label: 'Bullseye!', color: 'text-emerald-400', bg: 'from-emerald-950/80 to-slate-900/95', icon: Target }
  if (score >= 600) return { label: 'Great Shot!', color: 'text-blue-400', bg: 'from-blue-950/80 to-slate-900/95', icon: Sparkles }
  if (score >= 300) return { label: 'Getting Closer', color: 'text-amber-400', bg: 'from-amber-950/60 to-slate-900/95', icon: MapPin }
  return { label: 'Way Off!', color: 'text-red-400', bg: 'from-red-950/60 to-slate-900/95', icon: CircleX }
}

export function SpinResultOverlay({ scoreResult, challenge, roundsPlayed, sessionScore, onNextRound }: SpinResultOverlayProps) {
  const rating = getRating(scoreResult.totalScore)
  const Icon = rating.icon

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className={`bg-gradient-to-t ${rating.bg} border-t border-slate-700 rounded-t-2xl p-5 max-w-lg mx-auto space-y-4 animate-slide-up`}>
        {/* Rating + Score — compact horizontal layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              scoreResult.totalScore >= 600 ? 'bg-emerald-500/20' : scoreResult.totalScore >= 300 ? 'bg-amber-500/20' : 'bg-red-500/20'
            }`}>
              <Icon className={`w-6 h-6 ${rating.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${rating.color}`}>{rating.label}</p>
              <p className="text-xs text-slate-400">{scoreResult.distanceKm.toLocaleString()} km off</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{scoreResult.totalScore}</p>
            <p className="text-xs text-slate-400">points</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              scoreResult.totalScore >= 600 ? 'bg-emerald-500' : scoreResult.totalScore >= 300 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (scoreResult.totalScore / 1000) * 100)}%` }}
          />
        </div>

        {/* Your pin vs correct answer */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <p className="text-sm text-white font-medium">
              {challenge.location.name}, {challenge.location.country}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <p className="text-sm text-slate-400">Your pin</p>
          </div>
          {challenge.fun_fact && (
            <p className="text-xs text-indigo-300 italic pt-1 border-t border-slate-700/50">
              {challenge.fun_fact}
            </p>
          )}
        </div>

        {/* Hints penalty */}
        {scoreResult.hintsUsed > 0 && (
          <p className="text-xs text-amber-400 text-center">
            {scoreResult.hintsUsed} hint{scoreResult.hintsUsed > 1 ? 's' : ''} used (-{scoreResult.hintsUsed * 100} pts)
          </p>
        )}

        {/* Session stats + Next */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            R{roundsPlayed} &middot; {sessionScore} total
          </div>
          <button
            onClick={onNextRound}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next Round
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
