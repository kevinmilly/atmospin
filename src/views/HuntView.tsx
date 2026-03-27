import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { GlobeControls } from '@/components/globe/GlobeControls'
import { PromptCard } from '@/components/hunt/PromptCard'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { YearSelector } from '@/components/hunt/YearSelector'
import { ResultOverlay } from '@/components/hunt/ResultOverlay'
import { useHunt } from '@/hooks/useHunt'
import { useGlobeStore } from '@/store/globe'

export function HuntView() {
  const navigate = useNavigate()
  const zoomTier = useGlobeStore(s => s.zoomTier)

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
        {phase === 'hunting' && (
          <span className="text-sm font-medium text-slate-400">
            Zoom: Tier {zoomTier}
          </span>
        )}
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

      {/* Hunting UI — bottom panel */}
      {phase === 'hunting' && challenge && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-t-2xl p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Challenge prompt reminder */}
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
            {challenge.prompt_text}
          </p>

          {/* Year selector */}
          <YearSelector year={playerYear} onChange={setPlayerYear} />

          {/* Hints */}
          <HintDrawer
            hints={challenge.hints}
            hintsRevealed={hintsRevealed}
            onRevealHint={useHint}
          />

          {/* Submit */}
          <SubmitButton
            playerPin={playerPin}
            onSubmit={submitAnswer}
            disabled={phase !== 'hunting'}
          />
        </div>
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
