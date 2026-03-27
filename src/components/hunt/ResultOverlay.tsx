import { Trophy, MapPin, Clock, Lightbulb, ArrowRight } from 'lucide-react'
import type { ScoreResult } from '@/store/hunt'
import type { HuntChallenge, HistoricalEvent, Location } from '@/types'

interface ResultOverlayProps {
  scoreResult: ScoreResult
  challenge: HuntChallenge & { event: HistoricalEvent; location: Location }
  onNextHunt: () => void
}

function ScoreRow({ icon, label, value, max }: { icon: React.ReactNode; label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          {icon}
          {label}
        </div>
        <span className="font-mono text-white">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function getRating(score: number): { label: string; color: string } {
  if (score >= 1200) return { label: 'Perfect!', color: 'text-amber-400' }
  if (score >= 900) return { label: 'Excellent!', color: 'text-emerald-400' }
  if (score >= 600) return { label: 'Good', color: 'text-blue-400' }
  if (score >= 300) return { label: 'Fair', color: 'text-slate-300' }
  return { label: 'Keep Exploring', color: 'text-slate-400' }
}

export function ResultOverlay({ scoreResult, challenge, onNextHunt }: ResultOverlayProps) {
  const rating = getRating(scoreResult.totalScore)

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 max-w-sm w-full space-y-5 animate-slide-up">
        {/* Rating */}
        <div className="text-center">
          <Trophy className={`w-8 h-8 mx-auto mb-2 ${rating.color}`} />
          <p className={`text-xl font-bold ${rating.color}`}>{rating.label}</p>
          <p className="text-3xl font-bold text-white mt-1">{scoreResult.totalScore}</p>
          <p className="text-xs text-slate-400">points</p>
        </div>

        {/* Score breakdown */}
        <div className="space-y-3">
          <ScoreRow
            icon={<MapPin className="w-4 h-4" />}
            label={`Distance: ${scoreResult.distanceKm} km off`}
            value={scoreResult.distanceScore}
            max={1000}
          />
          <ScoreRow
            icon={<Clock className="w-4 h-4" />}
            label={`Time: ${Math.abs(scoreResult.yearDiff)} years off`}
            value={scoreResult.timeScore}
            max={500}
          />
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

        {/* Correct answer */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 space-y-1">
          <p className="text-xs text-slate-400">Correct Answer</p>
          <p className="text-sm font-semibold text-white">{challenge.event.title}</p>
          <p className="text-xs text-slate-400">
            {challenge.location.name}, {challenge.location.country} — {challenge.event.year_start}
          </p>
          {challenge.fun_fact && (
            <p className="text-xs text-indigo-300 mt-2 italic">{challenge.fun_fact}</p>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={onNextHunt}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
        >
          Next Hunt
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
