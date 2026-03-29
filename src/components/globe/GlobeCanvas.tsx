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

// Sub-national region labels shown on Easy at tier 3 (close zoom)
// Helps players identify places like Redwood NP (N. California), etc.
const REGION_LABELS = [
  // US States
  { lat: 37.8, lng: -122.4, text: 'California' },
  { lat: 31.0, lng: -100.0, text: 'Texas' },
  { lat: 44.0, lng: -120.5, text: 'Oregon' },
  { lat: 47.5, lng: -120.5, text: 'Washington' },
  { lat: 64.2, lng: -153.0, text: 'Alaska' },
  { lat: 20.5, lng: -157.0, text: 'Hawaii' },
  { lat: 43.0, lng: -75.5, text: 'New York' },
  { lat: 42.4, lng: -71.4, text: 'Massachusetts' },
  { lat: 38.9, lng: -77.0, text: 'Washington D.C.' },
  { lat: 25.8, lng: -80.2, text: 'Florida' },
  { lat: 32.8, lng: -83.6, text: 'Georgia' },
  { lat: 41.8, lng: -87.6, text: 'Illinois' },
  { lat: 44.9, lng: -93.1, text: 'Minnesota' },
  { lat: 39.1, lng: -105.4, text: 'Colorado' },
  { lat: 36.1, lng: -86.7, text: 'Tennessee' },
  { lat: 35.5, lng: -96.9, text: 'Oklahoma' },
  { lat: 46.9, lng: -110.4, text: 'Montana' },
  // Canadian Provinces
  { lat: 53.9, lng: -116.6, text: 'Alberta' },
  { lat: 53.7, lng: -127.6, text: 'British Columbia' },
  { lat: 53.8, lng: -98.8, text: 'Manitoba' },
  { lat: 46.6, lng: -66.5, text: 'New Brunswick' },
  { lat: 53.1, lng: -57.7, text: 'Newfoundland' },
  { lat: 64.8, lng: -124.8, text: 'Northwest Territories' },
  { lat: 44.7, lng: -63.6, text: 'Nova Scotia' },
  { lat: 68.3, lng: -83.1, text: 'Nunavut' },
  { lat: 44.2, lng: -78.6, text: 'Ontario' },
  { lat: 46.5, lng: -63.4, text: 'Prince Edward Island' },
  { lat: 52.9, lng: -73.5, text: 'Quebec' },
  { lat: 52.9, lng: -106.5, text: 'Saskatchewan' },
  { lat: 64.3, lng: -135.0, text: 'Yukon' },
  // Australian States
  { lat: -31.9, lng: 115.9, text: 'W. Australia' },
  { lat: -25.3, lng: 133.8, text: 'N. Territory' },
  { lat: -20.9, lng: 142.7, text: 'Queensland' },
  { lat: -32.0, lng: 147.0, text: 'New South Wales' },
  { lat: -37.0, lng: 144.0, text: 'Victoria' },
  { lat: -30.0, lng: 135.0, text: 'South Australia' },
  { lat: -42.0, lng: 147.0, text: 'Tasmania' },
  // Major European regions
  { lat: 40.4, lng: -3.7, text: 'Madrid' },
  { lat: 48.9, lng: 2.3, text: 'Île-de-France' },
  { lat: 51.5, lng: -0.1, text: 'London' },
  { lat: 52.5, lng: 13.4, text: 'Berlin' },
  { lat: 55.8, lng: 37.6, text: 'Moscow' },
  { lat: 59.9, lng: 10.7, text: 'Oslo' },
  { lat: 59.3, lng: 18.1, text: 'Stockholm' },
  { lat: 60.2, lng: 24.9, text: 'Helsinki' },
  // Major Chinese regions
  { lat: 39.9, lng: 116.4, text: 'Beijing' },
  { lat: 31.2, lng: 121.5, text: 'Shanghai' },
  { lat: 23.1, lng: 113.3, text: 'Guangdong' },
  { lat: 30.3, lng: 103.9, text: 'Sichuan' },
  // Indian states
  { lat: 28.6, lng: 77.2, text: 'Delhi' },
  { lat: 19.1, lng: 72.9, text: 'Maharashtra' },
  { lat: 13.1, lng: 80.3, text: 'Tamil Nadu' },
  { lat: 22.6, lng: 88.4, text: 'West Bengal' },
  { lat: 8.9, lng: 76.6, text: 'Kerala' },
  // Brazil states
  { lat: -23.5, lng: -46.6, text: 'São Paulo' },
  { lat: -15.8, lng: -47.9, text: 'Brasília' },
  { lat: -3.1, lng: -60.0, text: 'Amazonas' },
  { lat: -12.9, lng: -38.5, text: 'Bahia' },
  // African regions
  { lat: 30.1, lng: 31.2, text: 'Cairo' },
  { lat: -26.2, lng: 28.0, text: 'Johannesburg' },
  { lat: 6.5, lng: 3.4, text: 'Lagos' },
  { lat: -1.3, lng: 36.8, text: 'Nairobi' },
]

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
  /** When set, smoothly flies the camera to this point */
  focusPoint?: GlobePoint | null
  /** Slowly auto-rotates the globe (for home screen) */
  autoRotate?: boolean
}

export function GlobeCanvas({ onGlobeClick, pinPoint, correctPoint, interactive = true, difficulty = 4, focusPoint, autoRotate = false }: GlobeCanvasProps) {
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

  // Set up camera change listener once the globe is ready (not on mount — controls may not exist yet)
  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current
    if (!globe) return
    const controls = globe.controls()
    if (!controls) return

    const handleChange = () => {
      const pov = globe.pointOfView()
      if (pov) setViewpoint({ lat: pov.lat, lng: pov.lng, altitude: pov.altitude ?? 2.5 })
    }

    // Seed the initial zoom tier immediately
    handleChange()
    controls.addEventListener('change', handleChange)
  }, [setViewpoint])

  // Fly camera to focusPoint when it changes
  useEffect(() => {
    if (!focusPoint || !globeRef.current) return
    globeRef.current.pointOfView({ lat: focusPoint.lat, lng: focusPoint.lng, altitude: 1.8 }, 1300)
  }, [focusPoint])

  // Auto-rotate for home screen
  useEffect(() => {
    if (!autoRotate) return
    let frame: number
    const tick = () => {
      const globe = globeRef.current
      if (globe) {
        const pov = globe.pointOfView()
        globe.pointOfView({ ...pov, lng: ((pov.lng ?? 0) + 0.15) % 360 })
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [autoRotate])

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

  // HTML map pin elements — teardrop shape with label
  const makePinEl = useCallback((color: string, label: string) => {
    const el = document.createElement('div')
    el.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:none;transform:translateY(-100%)'
    el.innerHTML = `
      <svg viewBox="0 0 24 32" width="26" height="34" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">
        <path d="M12 1C7.03 1 3 5.03 3 10c0 7 9 21 9 21s9-14 9-21c0-4.97-4.03-9-9-9z"
          fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="4" fill="rgba(255,255,255,0.9)"/>
      </svg>
      <span style="color:white;font-size:10px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,0.9);white-space:nowrap;margin-top:1px">${label}</span>
    `
    return el
  }, [])

  const htmlPinData = useMemo(() => {
    const pins: { lat: number; lng: number; color: string; label: string }[] = []
    if (pinPoint) pins.push({ lat: pinPoint.lat, lng: pinPoint.lng, color: '#f43f5e', label: 'You' })
    if (correctPoint) pins.push({ lat: correctPoint.lat, lng: correctPoint.lng, color: '#22c55e', label: 'Answer' })
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

  // Country labels — computed whenever countries are loaded (difficulty gates display, not computation)
  const countryLabels = useMemo(() => {
    if (!countries.length) return []
    return countries
      .map(feat => {
        const centroid = getCentroid(feat)
        if (!centroid) return null
        return { lat: centroid.lat, lng: centroid.lng, text: feat.properties.ADMIN }
      })
      .filter((l): l is { lat: number; lng: number; text: string } => l !== null)
  }, [countries])

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
          htmlElementsData={htmlPinData}
          htmlElement={(d: object) => {
            const p = d as { color: string; label: string }
            return makePinEl(p.color, p.label)
          }}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.05}
          htmlTransitionDuration={300}
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
          onGlobeReady={handleGlobeReady}
          // Labels: continent labels for everyone at medium zoom, country/region labels at close zoom.
          // Difficulty only determines whether country-level labels show (Easy/Medium) or just regions.
          labelsData={
            zoomTier >= 3
              ? (difficulty <= 2 ? [...CONTINENT_LABELS, ...countryLabels, ...REGION_LABELS] : [...CONTINENT_LABELS, ...REGION_LABELS])
              : zoomTier >= 2
              ? (difficulty <= 2 ? [...CONTINENT_LABELS, ...countryLabels] : CONTINENT_LABELS)
              : []
          }
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={zoomTier >= 3 ? 0.6 : 1.4}
          labelColor={() => 'rgba(226,232,240,0.95)'}
          labelResolution={3}
          labelDotRadius={0}
          labelAltitude={0.02}
          // Ripple rings: green for correct answer, red for player pin
          ringsData={[
            ...(correctPoint ? [{ ...correctPoint, type: 'correct' }] : []),
            ...(pinPoint && !correctPoint ? [{ ...pinPoint, type: 'player' }] : []),
          ]}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: object) => (d as { type: string }).type === 'correct' ? 'rgba(34,197,94,0.65)' : 'rgba(244,63,94,0.55)'}
          ringMaxRadius={2.5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1200}
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
