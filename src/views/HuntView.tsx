import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Grip } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import type { HuntChallenge, HistoricalEvent, Location, GlobePoint } from '@/types'
import type { HuntPhase } from '@/store/hunt'
import { PromptCard } from '@/components/hunt/PromptCard'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { ChronoDial } from '@/components/chrono/ChronoDial'
import { ResultOverlay } from '@/components/hunt/ResultOverlay'
import { useHunt } from '@/hooks/useHunt'
import { useSettingsStore } from '@/store/settings'

export function HuntView() {
  const navigate = useNavigate()
  const difficulty = useSettingsStore(s => s.difficulty)

  const {
    phase,
    challenge,
    playerPin,
    playerYear,
    setPlayerYear,
    hintsRevealed,
    scoreResult,
    loadChallenge,
    startHunting,
    placePin,
    submitAnswer,
    useHint,
  } = useHunt()

  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  const correctPoint = useMemo(() => {
    if ((phase === 'result' || phase === 'submitted') && challenge) {
      return { lat: challenge.location.lat, lng: challenge.location.lng }
    }
    return null
  }, [phase, challenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden touch-manipulation">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 pointer-events-none">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="pointer-events-auto w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* Globe — takes all remaining vertical space */}
      <div className="flex-1 min-h-0">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          correctPoint={correctPoint}
          interactive={phase === 'hunting'}
          difficulty={difficulty}
        />
      </div>

      {phase === 'prompt' && challenge && (
        <PromptCard challenge={challenge} onStart={startHunting} />
      )}

      {phase === 'hunting' && challenge && (
        <HuntPanel
          challenge={challenge}
          playerPin={playerPin}
          playerYear={playerYear}
          setPlayerYear={setPlayerYear}
          hintsRevealed={hintsRevealed}
          useHint={useHint}
          submitAnswer={submitAnswer}
          phase={phase}
        />
      )}

      {phase === 'submitted' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300 mt-3 text-sm">Calculating score&hellip;</p>
          </div>
        </div>
      )}

      {phase === 'result' && scoreResult && challenge && (
        <ResultOverlay
          scoreResult={scoreResult}
          challenge={challenge}
          playerPin={playerPin}
          onNextHunt={loadChallenge}
        />
      )}
    </div>
  )
}

function HuntPanel({
  challenge, playerPin, playerYear, setPlayerYear,
  hintsRevealed, useHint, submitAnswer, phase,
}: {
  challenge: HuntChallenge & { event: HistoricalEvent; location: Location }
  playerPin: GlobePoint | null
  playerYear: number
  setPlayerYear: (y: number) => void
  hintsRevealed: number
  useHint: () => void
  submitAnswer: () => void
  phase: HuntPhase
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="shrink-0">
      {/* Expandable section */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/40 ${
          expanded ? 'max-h-[50vh]' : 'max-h-0'
        }`}
      >
        <div className="px-4 pt-3 pb-2 overflow-y-auto max-h-[50vh] space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {challenge.prompt_text}
          </p>
          <HintDrawer
            hints={challenge.hints}
            hintsRevealed={hintsRevealed}
            onRevealHint={useHint}
          />
        </div>
      </div>

      {/* Persistent bar */}
      <div className={`bg-slate-900/80 backdrop-blur-sm border-t transition-colors duration-300 ${
        expanded ? 'border-slate-700/40' : 'border-slate-800/30'
      } px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] space-y-2`}>
        {/* Toggle + year dial row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            className="flex items-center gap-1.5 text-xs transition-colors shrink-0 py-1.5 px-2 rounded-lg hover:bg-slate-800"
            style={{ color: expanded ? '#94a3b8' : '#475569' }}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <Grip className="w-3.5 h-3.5" />}
            <span>Hints</span>
          </button>
          <div className="flex-1 flex justify-center">
            <ChronoDial year={playerYear} onChange={setPlayerYear} />
          </div>
        </div>

        <SubmitButton
          playerPin={playerPin}
          onSubmit={submitAnswer}
          disabled={phase !== 'hunting'}
        />
      </div>
    </div>
  )
}
