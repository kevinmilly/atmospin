import { Lightbulb, Lock } from 'lucide-react'

interface HintDrawerProps {
  hints: string[]
  hintsRevealed: number
  onRevealHint: () => void
}

export function HintDrawer({ hints, hintsRevealed, onRevealHint }: HintDrawerProps) {
  const canReveal = hintsRevealed < hints.length

  return (
    <div className="space-y-2">
      {hints.map((hint, i) => (
        <div
          key={i}
          className={`rounded-lg p-3 text-sm transition-all ${
            i < hintsRevealed
              ? 'bg-amber-950/50 border border-amber-800/50 text-amber-200'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-500'
          }`}
        >
          <div className="flex items-start gap-2">
            {i < hintsRevealed ? (
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            )}
            <span>
              {i < hintsRevealed ? hint : `Hint ${i + 1} (-100 pts)`}
            </span>
          </div>
        </div>
      ))}

      {canReveal && (
        <button
          onClick={onRevealHint}
          className="w-full text-sm text-amber-400 hover:text-amber-300 py-2 transition-colors"
        >
          Reveal Next Hint (-100 pts)
        </button>
      )}
    </div>
  )
}
