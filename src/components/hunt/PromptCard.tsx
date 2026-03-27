import { Compass, Star } from 'lucide-react'
import type { HuntChallenge } from '@/types'

interface PromptCardProps {
  challenge: HuntChallenge
  onStart: () => void
}

export function PromptCard({ challenge, onStart }: PromptCardProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-400">Hunt Challenge</span>
        </div>

        <p className="text-lg text-white leading-relaxed">
          {challenge.prompt_text}
        </p>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < challenge.difficulty
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600'
              }`}
            />
          ))}
          <span className="text-xs text-slate-400 ml-2">
            Difficulty {challenge.difficulty}/5
          </span>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Start Hunting
        </button>
      </div>
    </div>
  )
}
