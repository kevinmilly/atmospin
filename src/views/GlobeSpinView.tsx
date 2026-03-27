import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Star } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { GlobeControls } from '@/components/globe/GlobeControls'
import { HintDrawer } from '@/components/hunt/HintDrawer'
import { SubmitButton } from '@/components/hunt/SubmitButton'
import { SpinResultOverlay } from '@/components/hunt/SpinResultOverlay'
import { useGlobeSpin } from '@/hooks/useGlobeSpin'

export function GlobeSpinView() {
  const navigate = useNavigate()

  const {
    phase, challenge, playerPin, hintsRevealed,
    scoreResult, roundsPlayed, sessionScore,
    loadChallenge, startHunting, placePin,
    submitAnswer, useHint,
  } = useGlobeSpin()

  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {roundsPlayed > 0 && (
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            Round {roundsPlayed + 1} &middot; {sessionScore} pts
          </div>
        )}
      </header>

      {/* Globe */}
      <div className="flex-1">
        <GlobeCanvas
          onGlobeClick={placePin}
          pinPoint={playerPin}
          interactive={phase === 'hunting'}
        />
      </div>

      {phase === 'hunting' && (
        <GlobeControls
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onRecenter={() => {}}
        />
      )}

      {/* Prompt overlay */}
      {phase === 'prompt' && challenge && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-5">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Globe Spin</span>
            </div>
            <p className="text-lg text-white leading-relaxed">
              {challenge.prompt}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < challenge.difficulty ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-400 ml-2">
                Difficulty {challenge.difficulty}/5
              </span>
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

      {/* Hunting panel */}
      {phase === 'hunting' && challenge && (
        <SpinPanel
          prompt={challenge.prompt}
          hints={challenge.hints}
          hintsRevealed={hintsRevealed}
          useHint={useHint}
          playerPin={playerPin}
          submitAnswer={submitAnswer}
        />
      )}

      {/* Submitting */}
      {phase === 'submitted' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300 mt-3 text-sm">Calculating...</p>
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && scoreResult && challenge && (
        <SpinResultOverlay
          scoreResult={scoreResult}
          challenge={challenge}
          roundsPlayed={roundsPlayed}
          sessionScore={sessionScore}
          onNextRound={loadChallenge}
        />
      )}
    </div>
  )
}

function SpinPanel({
  prompt, hints, hintsRevealed, useHint, playerPin, submitAnswer,
}: {
  prompt: string
  hints: string[]
  hintsRevealed: number
  useHint: () => void
  playerPin: { lat: number; lng: number } | null
  submitAnswer: () => void
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-t-2xl">
      <div className="px-4 py-4 space-y-3 max-h-[45vh] overflow-y-auto">
        <p className="text-sm text-slate-300 leading-relaxed">{prompt}</p>
        <HintDrawer hints={hints} hintsRevealed={hintsRevealed} onRevealHint={useHint} />
        <SubmitButton playerPin={playerPin} onSubmit={submitAnswer} />
      </div>
    </div>
  )
}
