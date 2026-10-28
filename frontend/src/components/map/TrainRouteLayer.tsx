import * as maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { useTrainRoute } from '../../hooks/useTrains'
import { useMapContext } from './MapContext'

interface TrainRouteLayerProps {
  trainNumber: string
}

export default function TrainRouteLayer({ trainNumber }: TrainRouteLayerProps) {
  const { map } = useMapContext()
  const { data: routeGeoJSON } = useTrainRoute(trainNumber)

  useEffect(() => {
    if (!map || !routeGeoJSON) return

    const sourceId = `train-route-${trainNumber}`
    const layerId = `train-route-line-${trainNumber}`

    // Add route source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: routeGeoJSON,
      })
    }

    // Add route layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#F97316',
          'line-width': 3,
          'line-opacity': 0.9,
        },
      }, 'stations-circle')
    }

    // Fit map to route bounds
    if (routeGeoJSON.geometry?.coordinates?.length > 0) {
      const coords = routeGeoJSON.geometry.coordinates as [number, number][]
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      )
      map.fitBounds(bounds, { padding: 60, maxZoom: 10 })
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [map, routeGeoJSON, trainNumber])

  return null
}
