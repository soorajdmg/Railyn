export type EntityKind = 'train' | 'station' | 'line' | 'zone' | 'division'

export interface StationRaw {
  code: string
  name: string
  lat: number
  lon: number
  divCode: string
  isJunction: boolean
}

export interface DivisionRaw {
  id: string
  name: string
  zone: string
  hq: string
}

export interface ZoneRaw {
  id: string
  name: string
  hq: string
  covered: boolean
  org: boolean
}

export interface LineRaw {
  id: string
  name: string
  seq: string[]
  zone: string
}

export interface Stop {
  code: string
  arr: number | null
  dep: number | null
  halt: number
  km: number
  day: number
  pass: boolean
}

export interface Train {
  num: string
  name: string
  type: 'Express' | 'Superfast' | 'Intercity' | 'Passenger'
  stops: Stop[]
  start: number
  days: number[]
  pair: string | null
  src: string
  dst: string
  km: number
  mins: number
}

export interface SearchResult {
  kind: EntityKind
  id: string
  code: string
  title: string
  sub: string
}
