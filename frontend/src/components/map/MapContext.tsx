import type { Map } from 'maplibre-gl'
import { createContext, useContext } from 'react'

export interface MapContextValue {
  map: Map | null
  selectedStationCode: string | null
  setSelectedStationCode: (code: string | null) => void
}

export const MapContext = createContext<MapContextValue>({
  map: null,
  selectedStationCode: null,
  setSelectedStationCode: () => {},
})

export const useMapContext = () => useContext(MapContext)
