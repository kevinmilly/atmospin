import { Calendar } from 'lucide-react'

interface YearSelectorProps {
  year: number
  onChange: (y: number) => void
}

/** Temporary year selector — will be replaced by ChronoDial in Phase 5 */
export function YearSelector({ year, onChange }: YearSelectorProps) {
  const displayYear = year < 0
    ? `${Math.abs(year)} BCE`
    : `${year} CE`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Calendar className="w-4 h-4" />
          <span>Year</span>
        </div>
        <span className="text-sm font-mono text-white">{displayYear}</span>
      </div>
      <input
        type="range"
        min={-3000}
        max={2025}
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>3000 BCE</span>
        <span>2025 CE</span>
      </div>
    </div>
  )
}
