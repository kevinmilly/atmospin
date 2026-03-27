import { ZoomIn, ZoomOut, LocateFixed } from 'lucide-react'

interface GlobeControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onRecenter: () => void
}

export function GlobeControls({ onZoomIn, onZoomOut, onRecenter }: GlobeControlsProps) {
  return (
    <div className="absolute bottom-24 right-4 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onRecenter}
        className="w-10 h-10 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
        aria-label="Recenter globe"
      >
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  )
}
