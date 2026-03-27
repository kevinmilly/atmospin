import { Lock } from 'lucide-react'
import type { GlobePoint } from '@/types'

interface SubmitButtonProps {
  playerPin: GlobePoint | null
  onSubmit: () => void
  disabled?: boolean
}

export function SubmitButton({ playerPin, onSubmit, disabled }: SubmitButtonProps) {
  const canSubmit = playerPin !== null && !disabled

  return (
    <button
      onClick={onSubmit}
      disabled={!canSubmit}
      className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all ${
        canSubmit
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
      }`}
    >
      <Lock className="w-4 h-4" />
      {canSubmit ? 'Lock In Answer' : 'Place a pin to answer'}
    </button>
  )
}
