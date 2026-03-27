import { MapPin, Clock, Lightbulb, ArrowRight, Sparkles, Target, CircleX } from 'lucide-react'
import type { ScoreResult } from '@/store/hunt'
import type { HuntChallenge, HistoricalEvent, Location } from '@/types'

interface ResultOverlayProps {
  scoreResult: ScoreResult
  challenge: HuntChallenge & { event: HistoricalEvent; location: Location }
  onNextHunt: () => void
}

function getRating(score: number): { label: string; color: string; bg: string; icon: typeof Sparkles } {
  if (score >= 1200) return { label: 'Perfect Hunt!', color: 'text-emerald-400', bg: 'from-emerald-950/80 to-slate-900/95', icon: Target }
  if (score >= 800) return { label: 'Great Hunt!', color: 'text-blue-400', bg: 'from-blue-950/80 to-slate-900/95', icon: Sparkles }
  if (score >= 400) return { label: 'Getting Warmer', color: 'text-amber-400', bg: 'from-amber-950/60 to-slate-900/95', icon: MapPin }
  return { label: 'Way Off!', color: 'text-red-400', bg: 'from-red-950/60 to-slate-900/95', icon: CircleX }
}

export function ResultOverlay({ scoreResult, challenge, onNextHunt }: ResultOverlayProps) {
  const rating = getRating(scoreResult.totalScore)
  const Icon = rating.icon

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className={`bg-gradient-to-t ${rating.bg} border-t border-slate-700 rounded-t-2xl p-5 max-w-lg mx-auto space-y-4 animate-slide-up`}>
        {/* Rating + Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              scoreResult.totalScore >= 800 ? 'bg-emerald-500/20' : scoreResult.totalScore >= 400 ? 'bg-amber-500/20' : 'bg-red-500/20'
            }`}>
              <Icon className={`w-6 h-6 ${rating.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${rating.color}`}>{rating.label}</p>
              <p className="text-xs text-slate-400">
                {scoreResult.distanceKm.toLocaleString()} km &middot; {Math.abs(scoreResult.yearDiff)} yrs off
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{scoreResult.totalScore}</p>
            <p className="text-xs text-slate-400">/ 1500</p>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
              <span>{scoreResult.distanceScore}/1000</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(scoreResult.distanceScore / 1000) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
              <span>{scoreResult.timeScore}/500</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-1000" style={{ width: `${(scoreResult.timeScore / 500) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Correct answer */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm text-white font-medium">{challenge.event.title}</p>
              <p className="text-xs text-slate-400">{challenge.location.name}, {challenge.location.country} — {challenge.event.year_start}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <p className="text-sm text-slate-400">Your pin</p>
          </div>
          {challenge.fun_fact && (
            <p className="text-xs text-indigo-300 italic pt-1 border-t border-slate-700/50">{challenge.fun_fact}</p>
          )}
        </div>

        {scoreResult.hintsUsed > 0 && (
          <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1">
            <Lightbulb className="w-3 h-3" />
            {scoreResult.hintsUsed} hint{scoreResult.hintsUsed > 1 ? 's' : ''} used (-{scoreResult.hintsUsed * 100} pts)
          </p>
        )}

        <button
          onClick={onNextHunt}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Next Hunt
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
