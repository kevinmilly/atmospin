import { useEffect, useRef, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Star, ChevronDown, Grip, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { music } from '@/lib/music'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { SpinResultOverlay } from '@/components/hunt/SpinResultOverlay'
import { TimerPill } from '@/components/hunt/TimerPill'
import { useGlobeSpin } from '@/hooks/useGlobeSpin'
import { useSettingsStore } from '@/store/settings'
import { useGlobeSpinStore, TIMER_SECONDS } from '@/store/globeSpin'
import { useAchievementsStore } from '@/store/achievements'
import { getStreakLabel, getStreakMultiplier } from '@/store/xp'

export function GlobeSpinView() {
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(false)
  const difficulty = useSettingsStore(s => s.difficulty)
  const currentStreak = useAchievementsStore(s => s.stats.currentStreak)
  const multiplier = getStreakMultiplier(currentStreak)
  const streakLabel = getStreakLabel(currentStreak)

  const {
    phase, challenge, playerPin, hintsRevealed,
    scoreResult, roundsPlayed, sessionScore,
    timeRemaining,
    loadChallenge, startHunting, placePin,
    submitAnswer, useHint,
  } = useGlobeSpin()

  const { startTimer, tickTimer } = useGlobeSpinStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSeconds = TIMER_SECONDS[difficulty] ?? 0

  useEffect(() => {
    loadChallenge()
    setPanelOpen(false)
    // Start game music when entering the game screen
    music.startGame()
    return () => music.stopGame(true) // restore theme on exit
  }, [loadChallenge])

  // Stop game music when result is showing (let SFX breathe)
  useEffect(() => {
    if (phase === 'result') music.stopGame()
    if (phase === 'hunting') music.startGame()
  }, [phase])

  // Timer loop — only for difficulty > 1
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (phase === 'hunting' && totalSeconds > 0) {
      startTimer(totalSeconds)
      timerRef.current = setInterval(tickTimer, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'hunting') {
      submitAnswer()
    }
  }, [timeRemaining, phase, submitAnswer])

  const correctPoint = useMemo(() => {
    if ((phase === 'result' || phase === 'submitted') && challenge) {
      return { lat: challenge.lat, lng: challenge.lng }
    }
    return null
  }, [phase, challenge])

  // Camera flies to correct answer when result is revealed
  const focusPoint = useMemo(() => {
    if (phase === 'result' && challenge) {
      return { lat: challenge.lat, lng: challenge.lng }
    }
    return null
  }, [phase, challenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden touch-manipulation">
      {/* Floating header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={() => { music.stopGame(true); navigate('/') }}
          aria-label="Back to home"
          className="pointer-events-auto w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pointer-events-none">
          {/* Streak multiplier badge */}
          <AnimatePresence>
            {currentStreak >= 3 && (
              <motion.div
                key={streakLabel}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold backdrop-blur-sm ${
                  multiplier >= 2.0 ? 'bg-violet-900/80 border-violet-500 text-violet-200' :
                  multiplier >= 1.5 ? 'bg-red-900/80 border-red-500 text-red-200' :
                  multiplier >= 1.25 ? 'bg-amber-900/80 border-amber-500 text-amber-200' :
                  'bg-orange-900/80 border-orange-600 text-orange-200'
                }`}
              >
                <Flame className="w-3 h-3" />
                {currentStreak} · {streakLabel}
              </motion.div>
            )}
          </AnimatePresence>

          {roundsPlayed > 0 && (
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              Round {roundsPlayed + 1} · {sessionScore} pts
            </div>
          )}
        </div>
      </header>

      {/* Globe */}
      <div className="flex-1 min-h-0">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          correctPoint={correctPoint}
          interactive={phase === 'hunting'}
          difficulty={difficulty}
          focusPoint={focusPoint}
        />
      </div>

      {/* Prompt overlay */}
      {phase === 'prompt' && challenge && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-5"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Globe Spin</span>
            </div>
            <p className="text-lg text-white leading-relaxed">{challenge.prompt}</p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < challenge.difficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              ))}
              <span className="text-xs text-slate-400 ml-2">Difficulty {challenge.difficulty}/5</span>
            </div>
            <button
              onClick={startHunting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Spin the Globe
            </button>
          </motion.div>
        </div>
      )}

      {/* Hunting bottom panel */}
      {phase === 'hunting' && challenge && (
        <div className="shrink-0">
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/40 ${
              panelOpen ? 'max-h-[42vh]' : 'max-h-0'
            }`}
          >
            <div className="px-4 pt-3 pb-2 overflow-y-auto max-h-[42vh]">
              <p className="text-xs text-slate-400 leading-relaxed mb-2 select-none">{challenge.prompt}</p>
              <HintDrawer hints={challenge.hints} hintsRevealed={hintsRevealed} onRevealHint={useHint} />
            </div>
          </div>

          <div className={`bg-slate-900/80 backdrop-blur-sm border-t transition-colors duration-300 ${
            panelOpen ? 'border-slate-700/40' : 'border-slate-800/30'
          } px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-2`}>
            <button
              onClick={() => setPanelOpen(o => !o)}
              aria-label={panelOpen ? 'Collapse hints' : 'Expand hints'}
              className="flex items-center gap-1.5 text-xs transition-colors shrink-0 py-1.5 px-2 rounded-lg hover:bg-slate-800"
              style={{ color: panelOpen ? '#94a3b8' : '#475569' }}
            >
              {panelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <Grip className="w-3.5 h-3.5" />}
              <span>Hints</span>
            </button>
            <TimerPill timeRemaining={timeRemaining} totalSeconds={totalSeconds} />
            <div className="flex-1">
              <SubmitButton playerPin={playerPin} onSubmit={submitAnswer} />
            </div>
          </div>
        </div>
      )}

      {phase === 'submitted' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {phase === 'result' && scoreResult && challenge && (
        <SpinResultOverlay
          scoreResult={scoreResult}
          challenge={challenge}
          roundsPlayed={roundsPlayed}
          sessionScore={sessionScore}
          playerPin={playerPin}
          onNextRound={loadChallenge}
        />
      )}
    </div>
  )
}
