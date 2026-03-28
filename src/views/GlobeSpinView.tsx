import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Star, ChevronDown, Grip } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { SpinResultOverlay } from '@/components/hunt/SpinResultOverlay'
import { useGlobeSpin } from '@/hooks/useGlobeSpin'
import { useSettingsStore } from '@/store/settings'

export function GlobeSpinView() {
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(false)
  const difficulty = useSettingsStore(s => s.difficulty)

  const {
    phase, challenge, playerPin, hintsRevealed,
    scoreResult, roundsPlayed, sessionScore,
    loadChallenge, startHunting, placePin,
    submitAnswer, useHint,
  } = useGlobeSpin()

  useEffect(() => {
    loadChallenge()
    setPanelOpen(false)
  }, [loadChallenge])

  const correctPoint = useMemo(() => {
    if ((phase === 'result' || phase === 'submitted') && challenge) {
      return { lat: challenge.lat, lng: challenge.lng }
    }
    return null
  }, [phase, challenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden touch-manipulation">
      {/* Floating header — sits above globe without taking flow space */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="pointer-events-auto w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {roundsPlayed > 0 && (
          <div className="pointer-events-none bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            Round {roundsPlayed + 1} &middot; {sessionScore} pts
          </div>
        )}
      </header>

      {/* Globe — takes all remaining space above the bottom panel */}
      <div className="flex-1 min-h-0">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          correctPoint={correctPoint}
          interactive={phase === 'hunting'}
          difficulty={difficulty}
        />
      </div>

      {/* Prompt overlay */}
      {phase === 'prompt' && challenge && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-5">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Globe Spin</span>
            </div>
            <p className="text-lg text-white leading-relaxed">{challenge.prompt}</p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < challenge.difficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
              <span className="text-xs text-slate-400 ml-2">Difficulty {challenge.difficulty}/5</span>
            </div>
            <button
              onClick={startHunting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Spin the Globe
            </button>
          </div>
        </div>
      )}

      {/* Hunting bottom panel — in flow, never covers globe */}
      {phase === 'hunting' && challenge && (
        <div className="shrink-0">
          {/* Expandable hint section */}
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

          {/* Collapsed bar — always visible, minimal */}
          <div className={`bg-slate-900/80 backdrop-blur-sm border-t transition-colors duration-300 ${
            panelOpen ? 'border-slate-700/40' : 'border-slate-800/30'
          } px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-2`}>
            <button
              onClick={() => setPanelOpen(o => !o)}
              aria-label={panelOpen ? 'Collapse hints' : 'Expand hints'}
              className="flex items-center gap-1.5 text-xs transition-colors shrink-0 py-1.5 px-2 rounded-lg hover:bg-slate-800"
              style={{ color: panelOpen ? '#94a3b8' : '#475569' }}
            >
              {panelOpen
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <Grip className="w-3.5 h-3.5" />
              }
              <span>Hints</span>
            </button>
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
