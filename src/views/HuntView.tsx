import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import type { HuntChallenge, HistoricalEvent, Location, GlobePoint } from '@/types'
import type { HuntPhase } from '@/store/hunt'
import { PromptCard } from '@/components/hunt/PromptCard'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { ChronoDial } from '@/components/chrono/ChronoDial'
import { ResultOverlay } from '@/components/hunt/ResultOverlay'
import { useHunt } from '@/hooks/useHunt'

export function HuntView() {
  const navigate = useNavigate()

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
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          correctPoint={correctPoint}
          interactive={phase === 'hunting'}
        />
      </div>

      {/* Globe controls removed — pinch-to-zoom handles zoom natively */}

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
        <ResultOverlay scoreResult={scoreResult} challenge={challenge} onNextHunt={loadChallenge} />
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
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? 'Collapse hints' : 'Expand hints'}
        className="w-full flex items-center justify-center pt-2 pb-1 text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      <div className="px-4 pb-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
          {challenge.prompt_text}
        </p>

        {/* Chrono-Dial */}
        <div className="flex justify-center">
          <ChronoDial year={playerYear} onChange={setPlayerYear} />
        </div>

        <SubmitButton
          playerPin={playerPin}
          onSubmit={submitAnswer}
          disabled={phase !== 'hunting'}
        />

        {expanded && (
          <HintDrawer
            hints={challenge.hints}
            hintsRevealed={hintsRevealed}
            onRevealHint={useHint}
          />
        )}
      </div>
    </div>
  )
}
