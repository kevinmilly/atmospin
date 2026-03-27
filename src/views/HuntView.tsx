import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { GlobeControls } from '@/components/globe/GlobeControls'
import type { HuntChallenge, HistoricalEvent, Location, GlobePoint } from '@/types'
import type { HuntPhase } from '@/store/hunt'
import { PromptCard } from '@/components/hunt/PromptCard'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { YearSelector } from '@/components/hunt/YearSelector'
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

  // Load first challenge on mount
  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* Globe fills the view */}
      <div className="flex-1">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          interactive={phase === 'hunting'}
        />
      </div>

      {/* Globe controls — only during hunting */}
      {phase === 'hunting' && (
        <GlobeControls
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onRecenter={() => {}}
        />
      )}

      {/* Prompt overlay */}
      {phase === 'prompt' && challenge && (
        <PromptCard challenge={challenge} onStart={startHunting} />
      )}

      {/* Hunting UI — bottom panel (collapsible) */}
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

      {/* Submitting state */}
      {phase === 'submitted' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300 mt-3 text-sm">Calculating score...</p>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {phase === 'result' && scoreResult && challenge && (
        <ResultOverlay
          scoreResult={scoreResult}
          challenge={challenge}
          onNextHunt={loadChallenge}
        />
      )}
    </div>
  )
}

/** Collapsible bottom panel for hunt controls */
function HuntPanel({
  challenge,
  playerPin,
  playerYear,
  setPlayerYear,
  hintsRevealed,
  useHint,
  submitAnswer,
  phase,
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
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-t-2xl">
      {/* Drag handle / expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center pt-2 pb-1 text-slate-500"
      >
        {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      <div className="px-4 pb-4 space-y-3">
        {/* Always visible: prompt + year + submit */}
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
          {challenge.prompt_text}
        </p>

        <YearSelector year={playerYear} onChange={setPlayerYear} />

        <SubmitButton
          playerPin={playerPin}
          onSubmit={submitAnswer}
          disabled={phase !== 'hunting'}
        />

        {/* Expanded: hints */}
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
