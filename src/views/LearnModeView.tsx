import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Shuffle, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { fetchRandomLearnPlace } from '@/lib/places'
import { useXpStore, calcXpGain } from '@/store/xp'
import { useAchievementsStore } from '@/store/achievements'
import type { GeoChallenge } from '@/store/globeSpin'
import { music } from '@/lib/music'

type Phase = 'idle' | 'flying' | 'reveal' | 'quiz' | 'result'

interface ShuffledQuiz {
  question: string
  answers: string[]   // shuffled
  correctIdx: number  // index of correct answer after shuffle
}

function shuffleQuiz(place: GeoChallenge): ShuffledQuiz | null {
  if (!place.quiz_question || !place.quiz_answers) return null
  const answers = [...place.quiz_answers]
  // Fisher-Yates shuffle, tracking where index 0 (correct) lands
  let correctIdx = 0
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    if (i === correctIdx) correctIdx = j
    else if (j === correctIdx) correctIdx = i
    ;[answers[i], answers[j]] = [answers[j], answers[i]]
  }
  return { question: place.quiz_question, answers, correctIdx }
}

export function LearnModeView() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [place, setPlace] = useState<GeoChallenge | null>(null)
  const [quiz, setQuiz] = useState<ShuffledQuiz | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [totalDiscoveries, setTotalDiscoveries] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)

  const { addXp } = useXpStore()
  const { stats } = useAchievementsStore()

  useEffect(() => {
    music.startTheme()
    return () => music.stopTheme()
  }, [])

  const discover = useCallback(async () => {
    setPhase('flying')
    setSelected(null)
    setXpGained(0)
    try {
      const next = await fetchRandomLearnPlace()
      setPlace(next)
      if (next) setQuiz(shuffleQuiz(next))
    } catch {
      setPhase('idle')
      return
    }
    // Let globe animation play, then reveal
    setTimeout(() => setPhase('reveal'), 1800)
  }, [])

  function startQuiz() {
    setPhase('quiz')
  }

  function answer(idx: number) {
    if (selected !== null || !quiz || !place) return
    setSelected(idx)
    const isCorrect = idx === quiz.correctIdx
    const xp = calcXpGain(
      isCorrect ? 400 : 50,
      0, false, false,
      stats.currentStreak >= 3,
    )
    addXp(xp)
    setXpGained(xp)
    setSessionXp(s => s + xp)
    setTotalDiscoveries(d => d + 1)
    setTimeout(() => setPhase('result'), 800)
  }

  const focusPoint = place && (phase === 'flying' || phase === 'reveal' || phase === 'quiz' || phase === 'result')
    ? { lat: place.lat, lng: place.lng }
    : null

  return (
    <div className="h-full flex flex-col relative overflow-hidden touch-manipulation">
      {/* Globe background */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas
          interactive={false}
          difficulty={1}
          focusPoint={focusPoint}
          correctPoint={focusPoint}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={() => { music.stopTheme(); navigate('/') }}
          aria-label="Back"
          className="pointer-events-auto w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pointer-events-none">
          {totalDiscoveries > 0 && (
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              {totalDiscoveries} discovered · {sessionXp} XP
            </div>
          )}
        </div>
      </header>

      {/* Bottom card area */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">

          {/* Idle — start screen */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl p-6 max-w-lg mx-auto space-y-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Learn Mode</h2>
                  <p className="text-xs text-slate-400">Discover weird & wonderful places</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Spin the globe, land somewhere unexpected, and learn something surprising.
                Answer a quick question to earn XP.
              </p>
              <button
                onClick={discover}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors"
              >
                <Shuffle className="w-5 h-5" />
                First Discovery
              </button>
            </motion.div>
          )}

          {/* Flying — loading spinner */}
          {phase === 'flying' && (
            <motion.div
              key="flying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-300">Navigating the globe…</span>
              </div>
            </motion.div>
          )}

          {/* Reveal — show the learn fact */}
          {phase === 'reveal' && place && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl p-5 max-w-lg mx-auto space-y-4 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{place.name}</h3>
                  <p className="text-xs text-slate-400">{place.country} · {place.category}</p>
                </div>
                <span className="text-2xl">📍</span>
              </div>

              <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-4">
                <p className="text-sm text-indigo-100 leading-relaxed">
                  {place.learn_fact ?? place.fun_fact}
                </p>
              </div>

              <button
                onClick={startQuiz}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Ready for the quiz →
              </button>
            </motion.div>
          )}

          {/* Quiz */}
          {phase === 'quiz' && quiz && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl p-5 max-w-lg mx-auto space-y-4 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-white leading-snug">{quiz.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {quiz.answers.map((ans, i) => {
                  const picked = selected !== null
                  const isCorrect = i === quiz.correctIdx
                  const isSelected = i === selected
                  let cls = 'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors border '
                  if (!picked) {
                    cls += 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                  } else if (isCorrect) {
                    cls += 'bg-emerald-900/60 border-emerald-600 text-emerald-200'
                  } else if (isSelected) {
                    cls += 'bg-red-900/60 border-red-600 text-red-200'
                  } else {
                    cls += 'bg-slate-800/40 border-slate-700/40 text-slate-500'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => answer(i)} disabled={picked}>
                      {ans}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {phase === 'result' && place && quiz && selected !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl p-5 max-w-lg mx-auto space-y-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {selected === quiz.correctIdx
                  ? <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                  : <XCircle className="w-7 h-7 text-red-400 shrink-0" />
                }
                <div>
                  <p className={`font-bold ${selected === quiz.correctIdx ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selected === quiz.correctIdx ? 'Correct!' : 'Not quite — but now you know!'}
                  </p>
                  {selected !== quiz.correctIdx && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Answer: {quiz.answers[quiz.correctIdx]}
                    </p>
                  )}
                </div>
              </div>

              {xpGained > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <Zap className="w-3.5 h-3.5" />
                  +{xpGained} XP earned
                </div>
              )}

              <button
                onClick={discover}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Next Discovery
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
