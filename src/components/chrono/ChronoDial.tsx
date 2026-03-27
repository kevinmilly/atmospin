import { useRef, useCallback, useState } from 'react'
import { Clock } from 'lucide-react'

interface ChronoDialProps {
  year: number
  onChange: (year: number) => void
  min?: number
  max?: number
}

const MIN_YEAR = -3000
const MAX_YEAR = 2025
const DIAL_RADIUS = 120
const TRACK_WIDTH = 8

/** Map an angle (0-360) to a year using a logarithmic-ish scale */
function angleToYear(angle: number, min: number, max: number): number {
  const t = angle / 360
  return Math.round(min + t * (max - min))
}

/** Map a year to an angle (0-360) */
function yearToAngle(year: number, min: number, max: number): number {
  return ((year - min) / (max - min)) * 360
}

/** Snap year to nearest decade (modern) or century (ancient) */
function snapYear(year: number): number {
  if (year > 1800) return Math.round(year / 10) * 10
  if (year > 0) return Math.round(year / 25) * 25
  return Math.round(year / 100) * 100
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)}`
  return `${year}`
}

function getEraLabel(year: number): string {
  if (year < -1000) return 'Ancient'
  if (year < 500) return 'Classical'
  if (year < 1400) return 'Medieval'
  if (year < 1700) return 'Early Modern'
  if (year < 1900) return 'Industrial'
  return 'Modern'
}

export function ChronoDial({ year, onChange, min = MIN_YEAR, max = MAX_YEAR }: ChronoDialProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)
  const angle = yearToAngle(year, min, max)

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    let a = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (a < 0) a += 360
    return a
  }, [])

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const a = getAngleFromEvent(clientX, clientY)
    const rawYear = angleToYear(a, min, max)
    onChange(snapYear(rawYear))
  }, [getAngleFromEvent, min, max, onChange])

  // Mouse/touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    ;(e.target as Element).setPointerCapture(e.pointerId)
    handleInteraction(e.clientX, e.clientY)
  }, [handleInteraction])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    handleInteraction(e.clientX, e.clientY)
  }, [dragging, handleInteraction])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  // SVG arc path
  const size = DIAL_RADIUS * 2 + 40
  const cx = size / 2
  const cy = size / 2
  const r = DIAL_RADIUS

  // Knob position
  const knobAngle = (angle - 90) * (Math.PI / 180)
  const knobX = cx + r * Math.cos(knobAngle)
  const knobY = cy + r * Math.sin(knobAngle)

  // Progress arc
  const endAngle = (angle - 90) * (Math.PI / 180)
  const startAngle = -90 * (Math.PI / 180)
  const largeArc = angle > 180 ? 1 : 0
  const arcEndX = cx + r * Math.cos(endAngle)
  const arcEndY = cy + r * Math.sin(endAngle)
  const arcStartX = cx + r * Math.cos(startAngle)
  const arcStartY = cy + r * Math.sin(startAngle)

  // Tick marks
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Year display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-2xl font-bold font-mono text-white">{formatYear(year)}</span>
        </div>
        <span className="text-xs text-slate-400">{getEraLabel(year)}</span>
      </div>

      {/* Dial */}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="touch-none select-none cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(51, 65, 85, 0.5)"
          strokeWidth={TRACK_WIDTH}
        />

        {/* Progress arc */}
        <path
          d={`M ${arcStartX} ${arcStartY} A ${r} ${r} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke="url(#dialGradient)"
          strokeWidth={TRACK_WIDTH}
          strokeLinecap="round"
        />

        {/* Gradient */}
        <defs>
          <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Tick marks */}
        {ticks.map(t => {
          const ta = (t - 90) * (Math.PI / 180)
          const x1 = cx + (r - 14) * Math.cos(ta)
          const y1 = cy + (r - 14) * Math.sin(ta)
          const x2 = cx + (r - 8) * Math.cos(ta)
          const y2 = cy + (r - 8) * Math.sin(ta)
          return (
            <line
              key={t}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth={1.5}
            />
          )
        })}

        {/* Knob */}
        <circle
          cx={knobX} cy={knobY} r={dragging ? 14 : 12}
          fill="#6366f1"
          stroke="white"
          strokeWidth={3}
          className="transition-all duration-75"
        />
      </svg>
    </div>
  )
}
