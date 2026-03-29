interface TimerPillProps {
  timeRemaining: number | null
  totalSeconds: number
}

export function TimerPill({ timeRemaining, totalSeconds }: TimerPillProps) {
  if (timeRemaining === null) return null

  const mins = Math.floor(timeRemaining / 60)
  const secs = timeRemaining % 60
  const formatted = `${mins}:${String(secs).padStart(2, '0')}`
  const fraction = totalSeconds > 0 ? timeRemaining / totalSeconds : 1

  const colorClass =
    fraction <= 0.25
      ? 'bg-red-950/80 border-red-700 text-red-300'
      : fraction <= 0.5
      ? 'bg-amber-950/80 border-amber-700 text-amber-300'
      : 'bg-slate-800/80 border-slate-600 text-slate-300'

  const pulse = fraction <= 0.25 ? 'animate-pulse' : ''

  return (
    <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold tabular-nums backdrop-blur-sm ${colorClass} ${pulse}`}>
      ⏱ {formatted}
    </div>
  )
}
