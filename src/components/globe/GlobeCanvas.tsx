import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import GlobeGL from 'react-globe.gl'
import { useGlobeStore } from '@/store/globe'
import { haptics } from '@/lib/haptics'
import type { GlobePoint } from '@/types'
import type { DifficultyTier } from '@/store/settings'
import { estimateContinent } from '@/lib/geo'

interface CountryFeature {
  properties: { ADMIN: string; ISO_A2: string; MAPCOLOR7: number }
  geometry: { type: string; coordinates: number[][][] | number[][][][] }
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

// Continent colors for Hard difficulty (more distinct, grouped by continent)
const CONTINENT_COLORS: Record<string, string> = {
  'Europe': 'rgba(99, 102, 241, 0.50)',
  'Asia': 'rgba(20, 184, 166, 0.45)',
  'Africa': 'rgba(245, 158, 11, 0.45)',
  'North America': 'rgba(59, 130, 246, 0.45)',
  'South America': 'rgba(16, 185, 129, 0.45)',
  'Oceania': 'rgba(236, 72, 153, 0.40)',
  'Antarctica': 'rgba(148, 163, 184, 0.30)',
}

// Continent label positions for Medium difficulty
const CONTINENT_LABELS = [
  { lat: 50, lng: 15, text: 'Europe' },
  { lat: 35, lng: 90, text: 'Asia' },
  { lat: 3, lng: 20, text: 'Africa' },
  { lat: 48, lng: -100, text: 'N. America' },
  { lat: -15, lng: -58, text: 'S. America' },
  { lat: -25, lng: 135, text: 'Australia' },
  { lat: -75, lng: 0, text: 'Antarctica' },
  // Major islands / landmasses
  { lat: 72, lng: -42, text: 'Greenland' },
  { lat: -20, lng: 46, text: 'Madagascar' },
  { lat: 64, lng: -19, text: 'Iceland' },
  { lat: 0, lng: 114, text: 'Borneo' },
  { lat: -6, lng: 137, text: 'New Guinea' },
  { lat: -42, lng: 172, text: 'New Zealand' },
]

/** Compute a rough centroid (bounding-box center) for a GeoJSON polygon feature */
function getCentroid(feature: CountryFeature): { lat: number; lng: number } | null {
  try {
    const coords: number[][] = []
    const geom = feature.geometry
    const rings = geom.type === 'Polygon'
      ? [geom.coordinates[0] as number[][]]
      : (geom.coordinates as number[][][][]).map(p => p[0])
    for (const ring of rings) for (const c of ring) coords.push(c)
    if (!coords.length) return null
    const lngs = coords.map(c => c[0])
    const lats = coords.map(c => c[1])
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    }
  } catch {
    return null
  }
}

interface GlobeCanvasProps {
  onGlobeClick?: (point: GlobePoint) => void
  pinPoint?: GlobePoint | null
  correctPoint?: GlobePoint | null
  interactive?: boolean
  difficulty?: DifficultyTier
}

export function GlobeCanvas({ onGlobeClick, pinPoint, correctPoint, interactive = true, difficulty = 4 }: GlobeCanvasProps) {
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

  // Pin marker data — player pin (red) + correct answer pin (green)
  const pinData = useMemo(() => {
    const pins: { lat: number; lng: number; color: string; size: number }[] = []
    if (pinPoint) pins.push({ lat: pinPoint.lat, lng: pinPoint.lng, color: '#f43f5e', size: 0.6 })
    if (correctPoint) pins.push({ lat: correctPoint.lat, lng: correctPoint.lng, color: '#22c55e', size: 0.8 })
    return pins
  }, [pinPoint, correctPoint])

  // Arc between player pin and correct answer
  const arcData = useMemo(() => {
    if (!pinPoint || !correctPoint) return []
    return [{
      startLat: pinPoint.lat, startLng: pinPoint.lng,
      endLat: correctPoint.lat, endLng: correctPoint.lng,
    }]
  }, [pinPoint, correctPoint])

  // Country labels for Easy difficulty
  const countryLabels = useMemo(() => {
    if (difficulty !== 1 || !countries.length) return []
    return countries
      .map(feat => {
        const centroid = getCentroid(feat)
        if (!centroid) return null
        return { lat: centroid.lat, lng: centroid.lng, text: feat.properties.ADMIN }
      })
      .filter((l): l is { lat: number; lng: number; text: string } => l !== null)
  }, [difficulty, countries])

  // Polygon colors
  const getPolygonCapColor = useCallback((d: object) => {
    const feat = d as CountryFeature
    if (feat.properties.ADMIN === hoveredCountry) {
      return 'rgba(129, 140, 248, 0.6)' // highlight on hover
    }
    if (difficulty === 3) {
      // Hard: continent-based colors
      const centroid = getCentroid(feat)
      const continent = centroid ? estimateContinent(centroid.lat, centroid.lng) : 'Asia'
      return CONTINENT_COLORS[continent] ?? COUNTRY_COLORS[feat.properties.MAPCOLOR7 % COUNTRY_COLORS.length]
    }
    return COUNTRY_COLORS[feat.properties.MAPCOLOR7 % COUNTRY_COLORS.length]
  }, [hoveredCountry, difficulty])

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
          pointColor="color"
          pointAltitude={0.12}
          pointRadius="size"
          pointsTransitionDuration={200}
          arcsData={arcData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ['#f43f5e', '#22c55e']}
          arcStroke={1.5}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcsTransitionDuration={500}
          animateIn={true}
          waitForGlobeReady={true}
          // Difficulty-based labels
          labelsData={difficulty === 1 ? countryLabels : difficulty === 2 ? CONTINENT_LABELS : []}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={difficulty === 1 ? 0.4 : 0.7}
          labelColor={() => difficulty === 1 ? 'rgba(226,232,240,0.75)' : 'rgba(226,232,240,0.9)'}
          labelResolution={2}
          labelAltitude={0.02}
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
