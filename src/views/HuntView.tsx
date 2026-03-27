import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { GlobeCanvas } from '@/components/globe/GlobeCanvas'
import { GlobeControls } from '@/components/globe/GlobeControls'
import { useGlobeStore } from '@/store/globe'
import type { GlobePoint } from '@/types'

export function HuntView() {
  const navigate = useNavigate()
  const pin = useGlobeStore(s => s.pin)
  const setPin = useGlobeStore(s => s.setPin)
  const zoomTier = useGlobeStore(s => s.zoomTier)
  const globeRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  const handleGlobeClick = useCallback((point: GlobePoint) => {
    setPin(point)
  }, [setPin])

  // These will be wired to the globe ref in Phase 5 for camera control
  const handleZoomIn = useCallback(() => {
    // Placeholder — globe ref camera control will be added
  }, [])

  const handleZoomOut = useCallback(() => {
    // Placeholder
  }, [])

  const handleRecenter = useCallback(() => {
    // Placeholder
  }, [])

  return (
    <div className="h-full flex flex-col relative" ref={globeRef}>
      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-slate-300">
          Zoom: Tier {zoomTier}
        </span>
      </header>

      {/* Globe fills the view */}
      <div className="flex-1">
        <GlobeCanvas
          onGlobeClick={handleGlobeClick}
          pinPoint={pin}
        />
      </div>

      {/* Globe controls overlay */}
      <GlobeControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
      />

      {/* Pin info overlay */}
      {pin && (
        <div className="absolute bottom-4 left-4 right-16 z-10 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3">
          <p className="text-xs text-slate-400">Pinned Location</p>
          <p className="text-sm text-white font-mono">
            {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  )
}
