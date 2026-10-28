export interface Zone {
  id: number
  name: string
  code: string
  hq_city: string | null
  hq_station_code: string | null
  website: string | null
}

export interface ZoneDetail extends Zone {
  divisions: Division[]
}

export interface Division {
  id: number
  name: string
  code: string
  zone_id: number
  hq_city: string | null
  hq_station_code: string | null
  zone?: { id: number; name: string; code: string }
}

export interface DivisionDetail extends Division {
  stations_count: number
}
