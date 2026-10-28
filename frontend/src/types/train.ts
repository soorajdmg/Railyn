export interface Train {
  id: number
  train_number: string
  name: string
  train_type: string | null
  source_station_code: string | null
  destination_station_code: string | null
  distance_km: number | null
  duration_minutes: number | null
  runs_on: boolean[] | null // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  classes: string[]
}

export interface TrainDetail extends Train {
  zone_id: number | null
  zone?: { id: number; name: string; code: string }
  source_station?: { code: string; name: string }
  destination_station?: { code: string; name: string }
}

export interface TimetableStop {
  id: number
  train_id: number
  station_code: string
  station_name?: string
  stop_number: number
  arrival_time: string | null   // "HH:MM:SS"
  departure_time: string | null
  halt_minutes: number | null
  distance_from_origin_km: number | null
  day_offset: number
  platform: string | null
}

export interface TrainTimetable {
  train: TrainDetail
  stops: TimetableStop[]
}

export interface TrainGeoJSON {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  properties: {
    train_number: string
    name: string
  }
}

export interface PaginatedTrains {
  items: Train[]
  total: number
  page: number
  limit: number
}
