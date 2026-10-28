import { useState } from 'react'
import { DIVISIONS, LINES, STATIONS, daysText, fmTime, linesForStation, nearbyStations, trainsForStation } from '../../data/mockData'
import { useAppState } from '../../store/appState'
import type { SavedEntity } from '../../store/appState'
import { Chip, ChipRow } from '../ui/Chip'
import { EntityRow } from '../ui/EntityRow'
import { KVCard } from '../ui/KVCard'
import { SectionHeader } from '../ui/SectionHeader'
import { Switch } from '../ui/Switch'
import { BottomSheet } from './BottomSheet'

interface Props {
  stationCode: string
}

const DAY_OPTS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DIR_OPTS = ['Both ways', 'Northbound', 'Southbound']
const TYPE_OPTS = ['All types', 'Express', 'Superfast', 'Intercity', 'Passenger']

export function StationSheet({ stationCode }: Props) {
  const [dayFilter, setDayFilter] = useState('All')
  const [dirFilter, setDirFilter] = useState('Both ways')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [upcoming, setUpcoming] = useState(false)
  const { pushSheet, toggleFavourite, isFavourite, showToast } = useAppState()

  const station = STATIONS[stationCode]
  if (!station) return null

  const div = DIVISIONS[station.divCode]
  const fav = isFavourite('station', stationCode)

  const entityForSave: SavedEntity = {
    kind: 'station', id: stationCode, code: stationCode,
    title: station.name, sub: `${div?.zone} › ${div?.name}`, ts: Date.now(),
  }

  const allTrains = trainsForStation(stationCode)
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  const filtered = allTrains.filter(t => {
    const stop = t.stops.find(s => s.code === stationCode && !s.pass)
    if (!stop) return false

    if (dayFilter !== 'All') {
      const dayIdx = DAY_OPTS.indexOf(dayFilter) - 1
      if (!t.days.includes(dayIdx)) return false
    }

    if (dirFilter !== 'Both ways') {
      const dstSt = STATIONS[t.dst]
      if (dstSt) {
        const going = dstSt.lat > station.lat
        if (dirFilter === 'Northbound' && !going) return false
        if (dirFilter === 'Southbound' && going) return false
      }
    }

    if (typeFilter !== 'All types' && t.type !== typeFilter) return false

    if (upcoming) {
      const depMins = stop.dep ?? stop.arr ?? 0
      if (depMins % 1440 < nowMinutes) return false
    }

    return true
  })

  const lineIds = linesForStation(stationCode)
  const nearby = nearbyStations(stationCode)

  const openTrain = (num: string) => pushSheet({ kind: 'train', id: num })
  const openLine = (id: string) => pushSheet({ kind: 'line', id })
  const openStation = (code: string) => pushSheet({ kind: 'station', id: code })

  const timeStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`

  return (
    <BottomSheet
      kind="station"
      kicker={`Station${station.isJunction ? ' · Junction' : ''}`}
      title={station.name}
      code={stationCode}
      sub={`${div?.zone ?? ''} › ${div?.name ?? ''} Division`}
      canFav
      isFav={fav}
      onFav={() => { toggleFavourite(entityForSave); showToast(fav ? 'Removed from saved' : 'Saved to this device') }}
    >
      <div style={{ marginTop: 8 }}>
        <KVCard items={[
          { key: 'Station code', value: stationCode },
          { key: 'Coordinates', value: `${station.lat.toFixed(4)}, ${station.lon.toFixed(4)}` },
          { key: 'Zone', value: div?.zone ?? '—', color: '#2b6ef2', onClick: () => pushSheet({ kind: 'zone' as never, id: div?.zone ?? '' }) },
          { key: 'Division', value: `${div?.name ?? '—'} Division`, color: '#2b6ef2', onClick: () => pushSheet({ kind: 'division' as never, id: station.divCode }) },
          { key: 'Type', value: station.isJunction ? 'Junction' : 'Station' },
        ]} />
      </div>

      <SectionHeader title="Trains serving" count={`${filtered.length}`} />

      {/* Day filter chips */}
      <ChipRow>
        {DAY_OPTS.map(d => (
          <Chip key={d} label={d} active={dayFilter === d} onPress={() => setDayFilter(d)} />
        ))}
      </ChipRow>

      {/* Direction + type chips */}
      <ChipRow>
        {DIR_OPTS.map(d => (
          <Chip key={d} label={d} active={dirFilter === d} onPress={() => setDirFilter(d)} />
        ))}
        {TYPE_OPTS.map(d => (
          <Chip key={d} label={d} active={typeFilter === d} onPress={() => setTypeFilter(d)} />
        ))}
      </ChipRow>

      {/* Upcoming toggle */}
      <button
        onClick={() => setUpcoming(!upcoming)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44, padding: '0 2px', border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', color: '#0f1722', textAlign: 'left' }}
      >
        <span>
          Upcoming after {timeStr}
          <span style={{ display: 'block', fontSize: 11, color: '#7a8494' }}>Device clock · scheduled times</span>
        </span>
        <Switch on={upcoming} onToggle={() => setUpcoming(!upcoming)} amber />
      </button>

      {/* Train rows */}
      <div style={{ background: '#f1f4f8', borderRadius: 18, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '16px 12px', fontSize: 13, color: '#5b6574' }}>No scheduled trains match these filters.</div>
        ) : (
          filtered.map(t => {
            const stop = t.stops.find(s => s.code === stationCode)!
            const depTime = stop.dep ?? stop.arr
            const dst = STATIONS[t.dst]
            return (
              <div
                key={t.num}
                onClick={() => openTrain(t.num)}
                className="row-hover-2"
                style={{ display: 'grid', gridTemplateColumns: '52px minmax(0,1fr) auto', gap: 8, alignItems: 'center', minHeight: 58, padding: '6px 12px', borderBottom: '1px solid #e6eaf0', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {fmTime(depTime)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.num} · {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#5b6574' }}>
                    To {dst?.name ?? t.dst} · {daysText(t.days)}
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 11, background: '#fff', color: '#4a5463', fontSize: 10, fontWeight: 600 }}>
                  {t.type}
                </span>
              </div>
            )
          })
        )}
      </div>

      <SectionHeader title="Connected lines" />
      <div style={{ background: '#f1f4f8', borderRadius: 18, overflow: 'hidden' }}>
        {lineIds.length === 0 ? (
          <div style={{ padding: '14px 12px', fontSize: 13, color: '#5b6574' }}>No connected lines.</div>
        ) : (
          lineIds.map(id => (
            <EntityRow
              key={id}
              kind="line"
              code={id}
              title={LINES[id]?.name ?? id}
              sub={`${LINES[id]?.seq.length} stations · ${LINES[id]?.zone}`}
              onPress={() => openLine(id)}
              onSurface2
            />
          ))
        )}
      </div>

      <SectionHeader title="Nearby stations" />
      <div style={{ background: '#f1f4f8', borderRadius: 18, overflow: 'hidden' }}>
        {nearby.map(({ code, km }) => {
          const st = STATIONS[code]
          const d = DIVISIONS[st?.divCode ?? '']
          return (
            <EntityRow
              key={code}
              kind="station"
              code={code}
              title={st?.name ?? code}
              sub={`${km.toFixed(0)} km away · ${d?.name ?? ''}`}
              onPress={() => openStation(code)}
              onSurface2
            />
          )
        })}
      </div>
    </BottomSheet>
  )
}
