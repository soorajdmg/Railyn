import * as maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { LINES, STATIONS } from '../../data/mockData'
import { useAppState } from '../../store/appState'

const STYLE = 'https://tiles.openfreemap.org/styles/positron'

const COVERAGE_POLYGON = {
  type: 'Feature' as const,
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[
      [76.8, 8.0], [77.5, 8.0], [77.5, 8.5], [77.2, 9.5],
      [76.8, 10.2], [76.0, 11.5], [75.4, 12.0], [74.6, 13.5],
      [73.8, 15.5], [73.5, 15.5], [73.9, 14.5],
      [74.5, 12.8], [75.2, 11.0], [75.8, 10.2],
      [76.0, 9.0], [76.2, 8.2], [76.8, 8.0],
    ]],
  },
  properties: {},
}

const buildLinesGeoJSON = () => ({
  type: 'FeatureCollection' as const,
  features: Object.entries(LINES).map(([id, line]) => ({
    type: 'Feature' as const,
    properties: { id, zone: line.zone },
    geometry: {
      type: 'LineString' as const,
      coordinates: line.seq.map(code => [STATIONS[code].lon, STATIONS[code].lat]),
    },
  })),
})

const buildStationsGeoJSON = () => ({
  type: 'FeatureCollection' as const,
  features: Object.values(STATIONS).map(st => ({
    type: 'Feature' as const,
    properties: { code: st.code, name: st.name, isJunction: st.isJunction },
    geometry: { type: 'Point' as const, coordinates: [st.lon, st.lat] },
  })),
})

interface Props {
  routeCoords?: number[][]
  routeColor?: string
  selectedCode?: string
  originCode?: string
}

export function RailwayMap({ routeCoords, routeColor = '#2b6ef2', selectedCode, originCode }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const routeColorRef = useRef(routeColor)
  const [mapError, setMapError] = useState<string | null>(null)
  const coverageOutline = useAppState(s => s.coverageOutline)
  const stationLabels = useAppState(s => s.stationLabels)
  const replaceSheet = useAppState(s => s.replaceSheet)

  // Keep routeColorRef in sync so the load handler always uses latest value
  routeColorRef.current = routeColor

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE,
        center: [76.5, 10.5],
        zoom: 7,
        attributionControl: false,
      })
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Failed to initialize map')
      return
    }
    mapRef.current = map

    map.on('error', (e) => {
      // Only show critical errors (not tile 404s which are noisy)
      if (e.error && !String(e.error.message).includes('tiles')) {
        setMapError(e.error.message)
      }
    })

    map.on('load', () => {
      const color = routeColorRef.current

      map.addSource('coverage', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [COVERAGE_POLYGON] },
      })
      map.addLayer({ id: 'coverage-fill', type: 'fill', source: 'coverage', paint: { 'fill-color': '#0fa390', 'fill-opacity': 0.035 } })
      map.addLayer({ id: 'coverage-outline', type: 'line', source: 'coverage', paint: { 'line-color': '#0fa390', 'line-dasharray': [3, 2], 'line-width': 1.5, 'line-opacity': 0.7 } })

      map.addSource('lines', { type: 'geojson', data: buildLinesGeoJSON() })
      map.addLayer({ id: 'lines-konkan', type: 'line', source: 'lines', filter: ['==', ['get', 'zone'], 'KR'], paint: { 'line-color': '#9aa3b2', 'line-dasharray': [2, 2], 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 10, 3] } })
      map.addLayer({ id: 'lines-main', type: 'line', source: 'lines', filter: ['!=', ['get', 'zone'], 'KR'], paint: { 'line-color': '#3b4657', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 10, 3.5] } })
      map.addLayer({ id: 'lines-hit', type: 'line', source: 'lines', paint: { 'line-width': 16, 'line-opacity': 0 } })

      map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: { 'line-color': color, 'line-opacity': 0.28, 'line-blur': 6, 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 18] } })
      map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 3.5, 10, 6] } })

      map.addSource('stations', { type: 'geojson', data: buildStationsGeoJSON() })
      map.addLayer({ id: 'junctions', type: 'circle', source: 'stations', filter: ['==', ['get', 'isJunction'], true], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 7], 'circle-color': '#fff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#3b4657' } })
      map.addLayer({ id: 'stations-sm', type: 'circle', source: 'stations', filter: ['==', ['get', 'isJunction'], false], minzoom: 7, paint: { 'circle-radius': 4, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#3b4657' } })

      map.addSource('route-stops', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'route-stops-layer', type: 'circle', source: 'route-stops', paint: { 'circle-radius': 6, 'circle-color': '#fff', 'circle-stroke-width': 2.5, 'circle-stroke-color': color } })

      map.addSource('selected', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'selected-halo', type: 'circle', source: 'selected', paint: { 'circle-radius': 16, 'circle-color': ['get', 'color'], 'circle-opacity': 0.18 } })
      map.addLayer({ id: 'selected-dot', type: 'circle', source: 'selected', paint: { 'circle-radius': 8, 'circle-color': ['get', 'color'], 'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff' } })

      map.addLayer({ id: 'station-labels', type: 'symbol', source: 'stations', minzoom: 7.5, layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold', 'Open Sans Bold'], 'text-size': 11, 'text-offset': [0, 1.2], 'text-anchor': 'top' }, paint: { 'text-color': '#3b4657', 'text-halo-color': '#fff', 'text-halo-width': 1 } })

      map.on('click', 'lines-hit', (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features?.length) return
        const id = e.features[0].properties?.id as string
        if (id) replaceSheet({ kind: 'line', id })
      })
      map.on('click', 'junctions', (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features?.length) return
        const code = e.features[0].properties?.code as string
        if (code) replaceSheet({ kind: 'station', id: code })
      })
      map.on('click', 'stations-sm', (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features?.length) return
        const code = e.features[0].properties?.code as string
        if (code) replaceSheet({ kind: 'station', id: code })
      })

      map.on('mouseenter', 'lines-hit', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'lines-hit', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'junctions', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'junctions', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'stations-sm', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'stations-sm', () => { map.getCanvas().style.cursor = '' })
    })

    return () => { map.remove(); mapRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update route line data
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const tryUpdate = () => {
      const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined
      if (!src) return
      src.setData(routeCoords && routeCoords.length > 1 ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoords } }] } : { type: 'FeatureCollection', features: [] })
    }
    if (map.isStyleLoaded()) tryUpdate()
    else map.once('load', tryUpdate)
  }, [routeCoords])

  // Update route color when it changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const tryUpdate = () => {
      if (map.getLayer('route-glow')) map.setPaintProperty('route-glow', 'line-color', routeColor)
      if (map.getLayer('route-line')) map.setPaintProperty('route-line', 'line-color', routeColor)
      if (map.getLayer('route-stops-layer')) map.setPaintProperty('route-stops-layer', 'circle-stroke-color', routeColor)
    }
    if (map.isStyleLoaded()) tryUpdate()
    else map.once('load', tryUpdate)
  }, [routeColor])

  // Update selected station markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const tryUpdate = () => {
      const src = map.getSource('selected') as maplibregl.GeoJSONSource | undefined
      if (!src) return
      const features = []
      if (selectedCode && STATIONS[selectedCode]) {
        const st = STATIONS[selectedCode]
        features.push({ type: 'Feature' as const, properties: { color: '#2b6ef2' }, geometry: { type: 'Point' as const, coordinates: [st.lon, st.lat] } })
      }
      if (originCode && STATIONS[originCode]) {
        const st = STATIONS[originCode]
        features.push({ type: 'Feature' as const, properties: { color: '#0fa390' }, geometry: { type: 'Point' as const, coordinates: [st.lon, st.lat] } })
      }
      src.setData({ type: 'FeatureCollection', features })
    }
    if (map.isStyleLoaded()) tryUpdate()
    else map.once('load', tryUpdate)
  }, [selectedCode, originCode])

  // Update coverage outline visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const tryUpdate = () => {
      if (map.getLayer('coverage-outline')) map.setLayoutProperty('coverage-outline', 'visibility', coverageOutline ? 'visible' : 'none')
    }
    if (map.isStyleLoaded()) tryUpdate()
    else map.once('load', tryUpdate)
  }, [coverageOutline])

  // Update station labels visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const tryUpdate = () => {
      if (map.getLayer('station-labels')) map.setLayoutProperty('station-labels', 'visibility', stationLabels ? 'visible' : 'none')
    }
    if (map.isStyleLoaded()) tryUpdate()
    else map.once('load', tryUpdate)
  }, [stationLabels])

  if (mapError) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#e9edf2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#3b4657', textAlign: 'center' }}>Map failed to load</div>
        <div style={{ fontSize: 12, color: '#7a8494', textAlign: 'center', maxWidth: 280 }}>{mapError}</div>
        <button
          onClick={() => { setMapError(null); mapRef.current = null }}
          style={{ marginTop: 4, height: 36, padding: '0 16px', borderRadius: 18, border: 0, background: '#2b6ef2', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: '#e9edf2' }} />
}
