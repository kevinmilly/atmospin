import { DIFFICULTY_CONFIG, useSettingsStore } from '@/store/settings'
import type { DifficultyTier } from '@/store/settings'

const TIERS: DifficultyTier[] = [1, 2, 3, 4]

export function DifficultySelector() {
  const { difficulty, setDifficulty } = useSettingsStore()

  return (
    <div className="w-full max-w-xs space-y-2">
      <p className="text-xs text-slate-500 text-center">Difficulty — affects labels on globe & point multiplier</p>
      <div className="grid grid-cols-4 gap-1.5">
        {TIERS.map(tier => {
          const cfg = DIFFICULTY_CONFIG[tier]
          const active = difficulty === tier
          return (
            <button
              key={tier}
              onClick={() => setDifficulty(tier)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl border transition-all duration-200 ${
                active
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{cfg.name}</span>
              <span className={`text-[10px] font-mono ${active ? 'text-indigo-300' : 'text-slate-500'}`}>{cfg.label}</span>
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-slate-600 text-center">{DIFFICULTY_CONFIG[difficulty].description}</p>
    </div>
  )
}
