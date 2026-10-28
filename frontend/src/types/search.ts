export interface SearchResult {
  type: 'train' | 'station'
  id: number
  code: string         // train_number or station_code
  name: string
  subtext?: string     // e.g., "Express · TVC → NDLS" for train, "Kerala · SR" for station
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  total: number
}

export interface ServiceResult {
  train_number: string
  train_name: string
  train_type: string | null
  classes: string[]
  runs_on: boolean[]
  from_departure: string | null
  to_arrival: string | null
  duration_minutes: number | null
  distance_km: number | null
}
