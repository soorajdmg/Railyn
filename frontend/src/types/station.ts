export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface Station {
  id: number
  name: string
  code: string
  state: string | null
  is_junction: boolean
  is_terminus: boolean
}

export interface StationDetail extends Station {
  name_aliases: string[]
  location: GeoPoint | null
  elevation_m: number | null
  zone_id: number | null
  division_id: number | null
  platform_count: number | null
  zone?: { id: number; name: string; code: string }
  division?: { id: number; name: string; code: string }
  lines?: { id: number; name: string; code: string | null }[]
  trains_count: number
}

export interface StationGeoJSONFeature {
  type: 'Feature'
  geometry: GeoPoint
  properties: {
    id: number
    code: string
    name: string
    zone_code: string | null
    is_junction: boolean
    is_terminus: boolean
    state: string | null
  }
}

export interface StationGeoJSON {
  type: 'FeatureCollection'
  features: StationGeoJSONFeature[]
}

export interface PaginatedStations {
  items: Station[]
  total: number
  page: number
  limit: number
}
