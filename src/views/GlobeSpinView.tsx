import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Star } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
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

  // Show correct answer pin after result
  const correctPoint = useMemo(() => {
    if ((phase === 'result' || phase === 'submitted') && challenge) {
      return { lat: challenge.location.lat, lng: challenge.location.lng }
    }
    return null
  }, [phase, challenge])

  return (
    <div className="h-full flex flex-col relative overflow-hidden touch-manipulation">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {roundsPlayed > 0 && (
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            Round {roundsPlayed + 1} &middot; {sessionScore} pts
          </div>
        )}
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

      {phase === 'hunting' && challenge && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 py-3 space-y-2 max-h-[35vh] overflow-y-auto overscroll-contain">
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.prompt}</p>
            <HintDrawer hints={challenge.hints} hintsRevealed={hintsRevealed} onRevealHint={useHint} />
            <SubmitButton playerPin={playerPin} onSubmit={submitAnswer} />
          </div>
        </div>
      )}

      {phase === 'submitted' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

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
