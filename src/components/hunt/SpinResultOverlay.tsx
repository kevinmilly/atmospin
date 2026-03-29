import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Compass, MapPin, Share2, Sparkles, Target, CircleX, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import type { GeoChallenge, SessionRoundSummary, SpinScoreResult } from '@/store/globeSpin'
import type { GlobePoint } from '@/types'
import { audio } from '@/lib/audio'
import { estimateContinent, reverseGeocode } from '@/lib/geo'
import { useAchievementsStore } from '@/store/achievements'
import { useSettingsStore, DIFFICULTY_CONFIG } from '@/store/settings'
import { calcXpGain, getLevelInfo, useXpStore } from '@/store/xp'
import { useMasteryStore } from '@/store/mastery'
import { Confetti } from '@/components/ui/Confetti'
import { shareResult } from '@/lib/shareCard'

interface SpinResultOverlayProps {
  scoreResult: SpinScoreResult
  challenge: GeoChallenge
  roundsPlayed: number
  sessionScore: number
  playerPin: GlobePoint | null
  onNextRound: () => void
  onRedeemRegion: () => void
  previousRound: SessionRoundSummary | null
  bestDistanceThisSession: number | null
}

function getRating(score: number) {
  if (score >= 920) return { label: 'Bullseye!', color: 'text-emerald-400', bg: 'from-emerald-950/80 to-slate-900/95', icon: Target }
  if (score >= 750) return { label: 'Nailed It!', color: 'text-green-400', bg: 'from-green-950/80 to-slate-900/95', icon: Sparkles }
  if (score >= 560) return { label: 'Great Shot!', color: 'text-blue-400', bg: 'from-blue-950/80 to-slate-900/95', icon: Sparkles }
  if (score >= 380) return { label: 'Not Bad!', color: 'text-cyan-400', bg: 'from-cyan-950/60 to-slate-900/95', icon: MapPin }
  if (score >= 220) return { label: 'Getting Warmer', color: 'text-amber-400', bg: 'from-amber-950/60 to-slate-900/95', icon: MapPin }
  if (score >= 100) return { label: 'Wrong Continent?', color: 'text-orange-400', bg: 'from-orange-950/60 to-slate-900/95', icon: CircleX }
  if (score >= 30) return { label: 'Way Off!', color: 'text-red-400', bg: 'from-red-950/60 to-slate-900/95', icon: CircleX }
  return { label: 'Lost in Space!', color: 'text-rose-400', bg: 'from-rose-950/60 to-slate-900/95', icon: CircleX }
}

function useCountUp(target: number, delay = 200): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now() + delay
    const duration = 900

    const tick = (now: number) => {
      if (now < start) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, delay])

  return value
}

function getComparisonCopy(distanceKm: number, previousRound: SessionRoundSummary | null, bestDistanceThisSession: number | null, continent: string) {
  if (previousRound && distanceKm < previousRound.distanceKm) {
    return `Better than last round by ${(previousRound.distanceKm - distanceKm).toLocaleString()} km.`
  }
  if (bestDistanceThisSession !== null && distanceKm <= bestDistanceThisSession) {
    return `New best in ${continent} this session.`
  }
  if (previousRound && distanceKm > previousRound.distanceKm) {
    return `${(distanceKm - previousRound.distanceKm).toLocaleString()} km rougher than last round.`
  }
  return `Another shot in ${continent} could be the one.`
}

export function SpinResultOverlay({
  scoreResult,
  challenge,
  roundsPlayed,
  sessionScore,
  playerPin,
  onNextRound,
  onRedeemRegion,
  previousRound,
  bestDistanceThisSession,
}: SpinResultOverlayProps) {
  const rating = getRating(scoreResult.totalScore)
  const Icon = rating.icon
  const displayScore = useCountUp(scoreResult.totalScore)
  const [pinLocationName, setPinLocationName] = useState<string | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [isPersonalBest, setIsPersonalBest] = useState(false)
  const [leveledUp, setLeveledUp] = useState<string | null>(null)
  const [shareState, setShareState] = useState<'idle' | 'shared' | 'copied'>('idle')

  const recordRound = useAchievementsStore(s => s.recordRound)
  const recordMasteryRound = useMasteryStore(s => s.recordRound)
  const stats = useAchievementsStore(s => s.stats)
  const { addXp, recordPersonalBest } = useXpStore()
  const totalXp = useXpStore(s => s.totalXp)
  const difficulty = useSettingsStore(s => s.difficulty)
  const multiplier = DIFFICULTY_CONFIG[difficulty].multiplier

  const showConfetti = scoreResult.totalScore >= 850
  const continent = challenge.continent ?? estimateContinent(challenge.lat, challenge.lng)
  const comparisonCopy = getComparisonCopy(scoreResult.distanceKm, previousRound, bestDistanceThisSession, continent)

  async function handleShare() {
    const outcome = await shareResult({
      challengeName: challenge.name,
      country: challenge.country,
      totalScore: scoreResult.totalScore,
      distanceKm: scoreResult.distanceKm,
      difficulty,
      hintsUsed: scoreResult.hintsUsed,
      xpGained,
      isPersonalBest,
      speedBonus: scoreResult.speedBonus,
      roundsPlayed,
      sessionScore,
    })
    if (outcome === 'shared' || outcome === 'copied') {
      setShareState(outcome)
      setTimeout(() => setShareState('idle'), 2000)
    }
  }

  useEffect(() => {
    if (scoreResult.totalScore >= 500) audio.success()
    else if (scoreResult.totalScore < 150) audio.desync()

    const prevContinent = stats.continentsVisited
    recordRound({
      mode: 'spin',
      score: scoreResult.totalScore,
      difficulty,
      distanceKm: scoreResult.distanceKm,
      hintsUsed: scoreResult.hintsUsed,
      speedBonus: scoreResult.speedBonus,
      playedAt: new Date().toISOString(),
      challengeName: challenge.name,
      playerPin: playerPin ?? null,
    })
    recordMasteryRound({
      continent,
      score: scoreResult.totalScore,
      distanceKm: scoreResult.distanceKm,
    })

    const isPB = recordPersonalBest(challenge.id, scoreResult.distanceKm)
    setIsPersonalBest(isPB)

    const newContinent = playerPin ? estimateContinent(playerPin.lat, playerPin.lng) : null
    const isNewContinent = newContinent ? !prevContinent.includes(newContinent) : false

    const xp = calcXpGain(
      scoreResult.totalScore,
      scoreResult.hintsUsed,
      isNewContinent,
      isPB,
      stats.currentStreak >= 3,
    )

    const { leveled } = addXp(xp)
    setXpGained(xp)

    if (leveled) {
      const { current } = getLevelInfo(totalXp + xp)
      setLeveledUp(current.title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!playerPin) return
    reverseGeocode(playerPin.lat, playerPin.lng).then(setPinLocationName)
  }, [playerPin])

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-20"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      {showConfetti && <Confetti />}

      <div className={`bg-gradient-to-t ${rating.bg} border-t border-slate-700 rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-w-lg mx-auto space-y-4`}>
        {leveledUp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600/40 to-violet-600/40 border border-indigo-500/50 rounded-xl px-3 py-2 flex items-center justify-center gap-2"
          >
            <p className="text-sm font-bold text-indigo-200">Level Up! You are now a <span className="text-white">{leveledUp}</span></p>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              scoreResult.totalScore >= 700 ? 'bg-emerald-500/20' : scoreResult.totalScore >= 300 ? 'bg-amber-500/20' : 'bg-red-500/20'
            }`}>
              <Icon className={`w-6 h-6 ${rating.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${rating.color}`}>{rating.label}</p>
              <p className="text-xs text-slate-400">{scoreResult.distanceKm.toLocaleString()} km off</p>
              {isPersonalBest && (
                <p className="text-[10px] text-amber-400 font-medium">New personal best for this place.</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <motion.p
              className="text-3xl font-bold text-white tabular-nums"
              animate={displayScore === scoreResult.totalScore ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {displayScore.toLocaleString()}
            </motion.p>
            <p className="text-xs text-slate-400">points</p>
            {multiplier < 1 && (
              <p className="text-[10px] text-indigo-400">{DIFFICULTY_CONFIG[difficulty].label} difficulty</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/70 bg-slate-900/45 px-3 py-2">
          <p className="text-xs font-medium text-indigo-200">{comparisonCopy}</p>
        </div>

        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              scoreResult.totalScore >= 700 ? 'bg-emerald-500' : scoreResult.totalScore >= 300 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (scoreResult.totalScore / 1000) * 100)}%` }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.4 }}
          />
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm text-white font-medium">
              {challenge.name === challenge.country ? challenge.name : `${challenge.name}, ${challenge.country}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <p className="text-sm text-slate-400">
              Your pin{pinLocationName ? ` · ${pinLocationName}` : ''}
            </p>
          </div>
          {challenge.fun_fact && (
            <p className="text-xs text-indigo-300 italic pt-1 border-t border-slate-700/50">{challenge.fun_fact}</p>
          )}
        </div>

        {(scoreResult.hintsUsed > 0 || scoreResult.speedBonus > 0) && (
          <div className="flex items-center justify-center gap-3 text-xs">
            {scoreResult.hintsUsed > 0 && (
              <p className="text-amber-400">
                {scoreResult.hintsUsed} hint{scoreResult.hintsUsed > 1 ? 's' : ''} (-{scoreResult.hintsUsed * 100} pts)
              </p>
            )}
            {scoreResult.speedBonus > 0 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sky-400"
              >
                Speed +{scoreResult.speedBonus} pts
              </motion.p>
            )}
          </div>
        )}

        {xpGained > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-1.5 text-xs text-indigo-300"
          >
            <Zap className="w-3 h-3" />
            +{xpGained} XP
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 tabular-nums whitespace-nowrap shrink-0">
            Round {roundsPlayed} · {sessionScore} pts
          </div>
          <button
            onClick={handleShare}
            aria-label="Share result"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {shareState === 'idle'
              ? <Share2 className="w-4 h-4" />
              : <span className="text-[10px] font-bold text-emerald-400">{shareState === 'shared' ? 'Shared!' : 'Copied!'}</span>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRedeemRegion}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold py-3 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Redeem In {continent}
          </button>
          <button
            onClick={onNextRound}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next Round
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
