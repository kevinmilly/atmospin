import { create } from 'zustand'
import type { GlobePoint, ZoomTier } from '@/types'

interface GlobeState {
  // Current camera position
  viewpoint: { lat: number; lng: number; altitude: number }
  setViewpoint: (v: { lat: number; lng: number; altitude: number }) => void

  // Player's placed pin
  pin: GlobePoint | null
  setPin: (p: GlobePoint | null) => void

  // Zoom tier derived from altitude
  zoomTier: ZoomTier
  setZoomTier: (t: ZoomTier) => void

  // Hovered country
  hoveredCountry: string | null
  setHoveredCountry: (c: string | null) => void
}

export const useGlobeStore = create<GlobeState>((set) => ({
  viewpoint: { lat: 20, lng: 0, altitude: 2.5 },
  setViewpoint: (v) => {
    // Lower thresholds so labels appear at reasonable zoom levels
    const tier: ZoomTier = v.altitude > 1.4 ? 1 : v.altitude > 0.65 ? 2 : 3
    set({ viewpoint: v, zoomTier: tier })
  },

  pin: null,
  setPin: (p) => set({ pin: p }),

  zoomTier: 1,
  setZoomTier: (t) => set({ zoomTier: t }),

  hoveredCountry: null,
  setHoveredCountry: (c) => set({ hoveredCountry: c }),
}))
