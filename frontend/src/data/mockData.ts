import type { DivisionRaw, LineRaw, Stop, StationRaw, Train, ZoneRaw } from './types'

// ---------------------------------------------------------------------------
// Raw station data (real names + approx coordinates)
// ---------------------------------------------------------------------------
const S_RAW: Record<string, [string, number, number, string, number]> = {
  NCJ: ['Nagercoil Jn', 8.1777, 77.4110, 'TVC', 1],
  TVC: ['Thiruvananthapuram Central', 8.4875, 76.9525, 'TVC', 0],
  QLN: ['Kollam Jn', 8.8862, 76.5950, 'TVC', 1],
  KYJ: ['Kayamkulam Jn', 9.1747, 76.5050, 'TVC', 1],
  CNGR: ['Chengannur', 9.3196, 76.6115, 'TVC', 0],
  ALLP: ['Alappuzha', 9.4919, 76.3305, 'TVC', 0],
  KTYM: ['Kottayam', 9.5960, 76.5285, 'TVC', 0],
  ERS: ['Ernakulam Jn', 9.9696, 76.2913, 'TVC', 1],
  AWY: ['Aluva', 10.1080, 76.3533, 'TVC', 0],
  TCR: ['Thrissur', 10.5155, 76.2094, 'TVC', 0],
  SRR: ['Shoranur Jn', 10.7600, 76.2717, 'PGT', 1],
  PGT: ['Palakkad Jn', 10.7964, 76.6521, 'PGT', 1],
  CBE: ['Coimbatore Jn', 10.9965, 76.9670, 'SA', 1],
  TIR: ['Tirur', 10.9140, 75.9214, 'PGT', 0],
  CLT: ['Kozhikode', 11.2478, 75.7804, 'PGT', 0],
  CAN: ['Kannur', 11.8726, 75.3700, 'PGT', 0],
  KGQ: ['Kasaragod', 12.4960, 74.9877, 'PGT', 0],
  MAQ: ['Mangaluru Central', 12.8639, 74.8392, 'PGT', 0],
  UD: ['Udupi', 13.3409, 74.7539, 'KAWR', 0],
  KAWR: ['Karwar', 14.8017, 74.1307, 'KAWR', 0],
  MAO: ['Madgaon Jn', 15.2669, 73.9807, 'KAWR', 1],
}

export const STATIONS: Record<string, StationRaw> = Object.fromEntries(
  Object.entries(S_RAW).map(([code, [name, lat, lon, divCode, isJ]]) => [
    code,
    { code, name, lat, lon, divCode, isJunction: isJ === 1 },
  ])
)

export const DIVISIONS: Record<string, DivisionRaw> = {
  TVC: { id: 'TVC', name: 'Thiruvananthapuram', zone: 'SR', hq: 'Thiruvananthapuram' },
  PGT: { id: 'PGT', name: 'Palakkad', zone: 'SR', hq: 'Palakkad' },
  SA: { id: 'SA', name: 'Salem', zone: 'SR', hq: 'Salem' },
  KAWR: { id: 'KAWR', name: 'Karwar Region', zone: 'KR', hq: 'Karwar' },
}

export const ZONES: ZoneRaw[] = [
  { id: 'SR', name: 'Southern Railway', hq: 'Chennai', covered: true, org: false },
  { id: 'CR', name: 'Central Railway', hq: 'Mumbai CSMT', covered: false, org: false },
  { id: 'NR', name: 'Northern Railway', hq: 'New Delhi', covered: false, org: false },
  { id: 'SWR', name: 'South Western Railway', hq: 'Hubballi', covered: false, org: false },
  { id: 'KR', name: 'Konkan Railway', hq: 'Navi Mumbai', covered: true, org: true },
]

export const LINES: Record<string, LineRaw> = {
  L1: { id: 'L1', name: 'Nagercoil–Ernakulam via Kottayam', seq: ['NCJ', 'TVC', 'QLN', 'KYJ', 'CNGR', 'KTYM', 'ERS'], zone: 'SR' },
  L2: { id: 'L2', name: 'Kayamkulam–Ernakulam via Alappuzha', seq: ['KYJ', 'ALLP', 'ERS'], zone: 'SR' },
  L3: { id: 'L3', name: 'Ernakulam–Shoranur', seq: ['ERS', 'AWY', 'TCR', 'SRR'], zone: 'SR' },
  L4: { id: 'L4', name: 'Shoranur–Coimbatore', seq: ['SRR', 'PGT', 'CBE'], zone: 'SR' },
  L5: { id: 'L5', name: 'Shoranur–Mangaluru', seq: ['SRR', 'TIR', 'CLT', 'CAN', 'KGQ', 'MAQ'], zone: 'SR' },
  L6: { id: 'L6', name: 'Konkan Line (Mangaluru–Madgaon)', seq: ['MAQ', 'UD', 'KAWR', 'MAO'], zone: 'KR' },
}

// ---------------------------------------------------------------------------
// Timetable generator (mirrors prototype logic)
// ---------------------------------------------------------------------------
const SPEED: Record<string, number> = { Superfast: 62, Express: 52, Intercity: 50, Passenger: 38 }

const hav = (a: string, b: string): number => {
  const A = S_RAW[a], B = S_RAW[b], r = Math.PI / 180
  const dl = (B[1] - A[1]) * r, dn = (B[2] - A[2]) * r
  const x = Math.sin(dl / 2) ** 2 + Math.cos(A[1] * r) * Math.cos(B[1] * r) * Math.sin(dn / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(x))
}

type RawTrain = [string, string, string, string[], string[], number, number[], string | null]

const RAW: RawTrain[] = [
  ['16301', 'Coastal Express', 'Express', ['TVC', 'QLN', 'KYJ', 'CNGR', 'KTYM', 'ERS', 'AWY', 'TCR', 'SRR', 'TIR', 'CLT', 'CAN', 'KGQ', 'MAQ'], [], 14 * 60 + 15, [0, 1, 2, 3, 4, 5, 6], '16302'],
  ['16302', 'Coastal Express', 'Express', ['MAQ', 'KGQ', 'CAN', 'CLT', 'TIR', 'SRR', 'TCR', 'AWY', 'ERS', 'KTYM', 'CNGR', 'KYJ', 'QLN', 'TVC'], [], 16 * 60 + 30, [0, 1, 2, 3, 4, 5, 6], '16301'],
  ['12601', 'Western Ghats SF', 'Superfast', ['ERS', 'AWY', 'TCR', 'SRR', 'PGT', 'CBE'], ['AWY'], 7 * 60 + 10, [0, 2, 4], '12602'],
  ['12602', 'Western Ghats SF', 'Superfast', ['CBE', 'PGT', 'SRR', 'TCR', 'AWY', 'ERS'], ['AWY'], 15 * 60 + 40, [1, 3, 5], '12601'],
  ['16605', 'Backwater Intercity', 'Intercity', ['TVC', 'QLN', 'KYJ', 'ALLP', 'ERS'], [], 6 * 60, [0, 1, 2, 3, 4, 5, 6], '16606'],
  ['16606', 'Backwater Intercity', 'Intercity', ['ERS', 'ALLP', 'KYJ', 'QLN', 'TVC'], [], 17 * 60 + 20, [0, 1, 2, 3, 4, 5, 6], '16605'],
  ['10215', 'Konkan Link Express', 'Express', ['ERS', 'AWY', 'TCR', 'SRR', 'TIR', 'CLT', 'CAN', 'KGQ', 'MAQ', 'UD', 'KAWR', 'MAO'], ['TIR', 'KGQ'], 20 * 60 + 30, [1, 5], '10216'],
  ['10216', 'Konkan Link Express', 'Express', ['MAO', 'KAWR', 'UD', 'MAQ', 'KGQ', 'CAN', 'CLT', 'TIR', 'SRR', 'TCR', 'AWY', 'ERS'], ['TIR', 'KGQ'], 9 * 60, [2, 6], '10215'],
  ['56701', 'Southern Passenger', 'Passenger', ['NCJ', 'TVC', 'QLN', 'KYJ', 'CNGR', 'KTYM', 'ERS'], [], 4 * 60 + 45, [0, 1, 2, 3, 4, 5, 6], null],
]

export const TRAINS: Record<string, Train> = {}

RAW.forEach(([num, name, type, seq, pass, start, days, pair]) => {
  let t = start, km = 0
  const stops: Stop[] = []
  seq.forEach((c, i) => {
    if (i > 0) {
      const d = hav(seq[i - 1], c) * 1.22
      km += d
      t = Math.ceil((t + (d / SPEED[type]) * 60) / 5) * 5
    }
    const p = pass.includes(c)
    const first = i === 0, last = i === seq.length - 1
    const isJunction = S_RAW[c][4] === 1
    const isMajor = ['ERS', 'CLT', 'TCR', 'TVC'].includes(c)
    const halt = first || last || p ? 0 : (isJunction || isMajor ? 5 : 2)
    const arr = first ? null : t
    t += halt
    const dep = last ? null : t
    stops.push({ code: c, arr, dep, halt, km: Math.round(km), day: Math.floor(((arr ?? dep) ?? 0) / 1440) + 1, pass: p })
  })
  const L = stops[stops.length - 1]
  TRAINS[num] = {
    num, name, type: type as Train['type'], stops, start, days, pair,
    src: seq[0], dst: L.code, km: L.km, mins: (L.arr ?? 0) - start,
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const pad = (n: number): string => String(n).padStart(2, '0')
export const fmTime = (m: number | null): string =>
  m == null ? '—' : pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60)
export const fmDur = (m: number): string => Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm'
export const daysText = (d: number[]): string =>
  d.length === 7 ? 'Daily' : d.map(i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]).join(' ')

export const stationName = (code: string): string => STATIONS[code]?.name ?? code
export const divisionOf = (code: string): string => STATIONS[code]?.divCode ?? ''
export const zoneOf = (code: string): string => DIVISIONS[divisionOf(code)]?.zone ?? ''
export const zoneById = (id: string): ZoneRaw | undefined => ZONES.find(z => z.id === id)

// Haversine distance between two station codes (km)
export const distKm = (a: string, b: string): number => {
  const A = STATIONS[a], B = STATIONS[b]
  if (!A || !B) return 0
  const r = Math.PI / 180
  const dl = (B.lat - A.lat) * r, dn = (B.lon - A.lon) * r
  const x = Math.sin(dl / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(dn / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(x))
}

// Lines that pass through a station
export const linesForStation = (code: string): string[] =>
  Object.entries(LINES)
    .filter(([, l]) => l.seq.includes(code))
    .map(([id]) => id)

// Trains serving a station
export const trainsForStation = (code: string): Train[] =>
  Object.values(TRAINS).filter(t => t.stops.some(s => s.code === code && !s.pass))

// Trains between two stations
export const trainsBetween = (from: string, to: string): Train[] =>
  Object.values(TRAINS).filter(t => {
    const fromIdx = t.stops.findIndex(s => s.code === from && !s.pass)
    const toIdx = t.stops.findIndex(s => s.code === to && !s.pass)
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx
  })

// Nearest stations (excluding self)
export const nearbyStations = (code: string, n = 3): Array<{ code: string; km: number }> => {
  const st = STATIONS[code]
  if (!st) return []
  return Object.keys(STATIONS)
    .filter(c => c !== code)
    .map(c => ({ code: c, km: distKm(code, c) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n)
}

// Line cumulative km
export const lineKm = (lineId: string): number => {
  const line = LINES[lineId]
  if (!line) return 0
  let km = 0
  for (let i = 1; i < line.seq.length; i++) {
    km += distKm(line.seq[i - 1], line.seq[i])
  }
  return Math.round(km)
}

export const lineStopKms = (lineId: string): number[] => {
  const line = LINES[lineId]
  if (!line) return []
  const kms: number[] = [0]
  let km = 0
  for (let i = 1; i < line.seq.length; i++) {
    km += distKm(line.seq[i - 1], line.seq[i])
    kms.push(Math.round(km))
  }
  return kms
}

// Fuzzy search
const lev = (a: string, b: string): number => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

export const fuzzyScore = (q: string, t: string): number => {
  const tl = t.toLowerCase()
  if (tl.startsWith(q)) return 4
  if (tl.includes(q)) return 3
  if (q.length >= 3) {
    for (const w of tl.split(/[\s–\-]+/)) {
      if (lev(q, w.slice(0, q.length)) <= (q.length > 5 ? 2 : 1)) return 1
    }
  }
  return 0
}
