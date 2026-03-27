import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import GlobeGL from 'react-globe.gl'
import { useGlobeStore } from '@/store/globe'
import { haptics } from '@/lib/haptics'
import type { GlobePoint } from '@/types'

interface CountryFeature {
  properties: { ADMIN: string; ISO_A2: string; MAPCOLOR7: number }
  geometry: object
}

// Color palette for countries — muted dark tones so they don't overpower
const COUNTRY_COLORS = [
  'rgba(99, 102, 241, 0.35)',   // indigo
  'rgba(139, 92, 246, 0.30)',   // violet
  'rgba(59, 130, 246, 0.30)',   // blue
  'rgba(16, 185, 129, 0.30)',   // emerald
  'rgba(245, 158, 11, 0.25)',   // amber
  'rgba(236, 72, 153, 0.25)',   // pink
  'rgba(20, 184, 166, 0.30)',   // teal
]

interface GlobeCanvasProps {
  onGlobeClick?: (point: GlobePoint) => void
  pinPoint?: GlobePoint | null
  interactive?: boolean
}

export function GlobeCanvas({ onGlobeClick, pinPoint, interactive = true }: GlobeCanvasProps) {
  const globeRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<HTMLDivElement>(null)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const setViewpoint = useGlobeStore(s => s.setViewpoint)
  const setHoveredCountry = useGlobeStore(s => s.setHoveredCountry)
  const hoveredCountry = useGlobeStore(s => s.hoveredCountry)
  const zoomTier = useGlobeStore(s => s.zoomTier)

  // Load GeoJSON
  useEffect(() => {
    fetch('/countries.geojson')
      .then(r => r.json())
      .then(data => setCountries(data.features))
  }, [])

  // Track container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Track camera changes to update zoom tier
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()
    if (!controls) return

    const handleChange = () => {
      const pov = globe.pointOfView()
      if (pov) {
        setViewpoint({ lat: pov.lat, lng: pov.lng, altitude: pov.altitude })
      }
    }

    controls.addEventListener('change', handleChange)
    return () => controls.removeEventListener('change', handleChange)
  }, [setViewpoint])

  // Handle globe click
  const handleGlobeClick = useCallback(({ lat, lng }: { lat: number; lng: number }) => {
    if (!interactive) return
    haptics.pin()
    onGlobeClick?.({ lat, lng })
  }, [onGlobeClick, interactive])

  const handlePolygonClick = useCallback((_polygon: object, _event: MouseEvent, { lat, lng }: { lat: number; lng: number; altitude: number }) => {
    if (!interactive) return
    haptics.pin()
    onGlobeClick?.({ lat, lng })
  }, [onGlobeClick, interactive])

  // Pin marker data
  const pinData = useMemo(() => {
    if (!pinPoint) return []
    return [{ lat: pinPoint.lat, lng: pinPoint.lng }]
  }, [pinPoint])

  // Polygon colors
  const getPolygonCapColor = useCallback((d: object) => {
    const feat = d as CountryFeature
    if (feat.properties.ADMIN === hoveredCountry) {
      return 'rgba(129, 140, 248, 0.6)' // highlight on hover
    }
    return COUNTRY_COLORS[feat.properties.MAPCOLOR7 % COUNTRY_COLORS.length]
  }, [hoveredCountry])

  const getPolygonSideColor = useCallback(() => 'rgba(30, 41, 59, 0.8)', [])
  const getPolygonStrokeColor = useCallback(() => {
    return zoomTier >= 2 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.15)'
  }, [zoomTier])

  const getPolygonLabel = useCallback((d: object) => {
    if (zoomTier < 2) return ''
    return (d as CountryFeature).properties.ADMIN
  }, [zoomTier])

  const handlePolygonHover = useCallback((polygon: object | null) => {
    setHoveredCountry(polygon ? (polygon as CountryFeature).properties.ADMIN : null)
  }, [setHoveredCountry])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {dimensions.width > 0 && (
        <GlobeGL
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#6366f1"
          atmosphereAltitude={0.2}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          polygonsData={countries}
          polygonGeoJsonGeometry="geometry"
          polygonCapColor={getPolygonCapColor}
          polygonSideColor={getPolygonSideColor}
          polygonStrokeColor={getPolygonStrokeColor}
          polygonAltitude={0.01}
          polygonLabel={getPolygonLabel}
          polygonsTransitionDuration={300}
          onPolygonClick={handlePolygonClick}
          onPolygonHover={handlePolygonHover}
          onGlobeClick={handleGlobeClick}
          pointsData={pinData}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => '#f43f5e'}
          pointAltitude={0.12}
          pointRadius={0.6}
          pointsTransitionDuration={200}
          animateIn={true}
          waitForGlobeReady={true}
        />
      )}

      {/* Zoom tier indicator */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {[1, 2, 3].map(t => (
          <div
            key={t}
            className={`w-2 h-2 rounded-full transition-colors ${
              t <= zoomTier ? 'bg-indigo-400' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Crosshair for precise pin placement at zoom tier 3 */}
      {zoomTier === 3 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-full bg-indigo-400/50" />
            <div className="absolute top-1/2 left-0 -translate-y-px w-full h-0.5 bg-indigo-400/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-indigo-400/70" />
          </div>
        </div>
      )}
    </div>
  )
}
