import { ArrowLeft, RotateCcw, Trophy, Target, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SessionRoundSummary } from '@/store/globeSpin'

interface RunSummaryOverlayProps {
  rounds: SessionRoundSummary[]
  totalScore: number
  title?: string
  onPlayAgain: () => void
  onBackHome: () => void
}

function getRunRank(totalScore: number) {
  if (totalScore >= 2400) return 'Master Navigator'
  if (totalScore >= 1800) return 'Elite Cartographer'
  if (totalScore >= 1200) return 'Sharp Explorer'
  if (totalScore >= 700) return 'Steady Scout'
  return 'Curious Wanderer'
}

export function RunSummaryOverlay({ rounds, totalScore, title = 'Sprint Complete', onPlayAgain, onBackHome }: RunSummaryOverlayProps) {
  const bestRound = rounds.reduce((best, round) => round.totalScore > best.totalScore ? round : best, rounds[0])
  const averageDistance = Math.round(rounds.reduce((sum, round) => sum + round.distanceKm, 0) / rounds.length)
  const runRank = getRunRank(totalScore)

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-end justify-center bg-slate-950/75 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 26 }}
        className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/95 p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-300 font-semibold">{title}</p>
            <h2 className="text-2xl font-bold text-white">{runRank}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
            <p className="text-xl font-bold text-white tabular-nums">{totalScore.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Best Round</p>
            <p className="text-xl font-bold text-white tabular-nums">{bestRound.totalScore}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Avg Km Off</p>
            <p className="text-xl font-bold text-white tabular-nums">{averageDistance}</p>
          </div>
        </div>

        <div className="space-y-2">
          {rounds.map((round, index) => (
            <div key={round.challengeId} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Round {index + 1} · {round.continent}</p>
                <p className="text-sm font-semibold text-white truncate">{round.challengeName}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                  <Target className="w-3.5 h-3.5" />
                  {round.distanceKm} km
                </div>
                <div className="flex items-center justify-end gap-1 text-sm font-bold text-emerald-300">
                  <Gauge className="w-4 h-4" />
                  {round.totalScore}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackHome}
            className="w-12 h-12 rounded-2xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
            aria-label="Back home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Run It Again
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
