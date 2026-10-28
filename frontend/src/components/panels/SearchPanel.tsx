import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DIVISIONS, LINES, STATIONS, TRAINS, ZONES, daysText, fmTime, fuzzyScore, trainsBetween } from '../../data/mockData'
import type { SearchResult } from '../../data/types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAppState } from '../../store/appState'
import { Chip, ChipRow } from '../ui/Chip'
import { EntityRow } from '../ui/EntityRow'
import { SectionHeader } from '../ui/SectionHeader'
import { Segmented } from '../ui/Segmented'

type SearchMode = 'all' | 'between'

// Build search index once
const buildResults = (q: string): Record<string, SearchResult[]> => {
  if (!q.trim()) return {}
  const ql = q.toLowerCase().trim()

  const score = (text: string) => fuzzyScore(ql, text)
  const best = (...texts: string[]) => Math.max(...texts.map(score))

  const trains: SearchResult[] = Object.values(TRAINS)
    .map(t => ({ t, s: best(t.num, t.name, t.type) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ t }) => ({
      kind: 'train' as const, id: t.num, code: t.num,
      title: t.name,
      sub: `${STATIONS[t.src]?.name ?? t.src} → ${STATIONS[t.dst]?.name ?? t.dst} · ${daysText(t.days)}`,
    }))

  const stations: SearchResult[] = Object.values(STATIONS)
    .map(s => ({ s, sc: best(s.code, s.name) }))
    .filter(x => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .map(({ s }) => ({
      kind: 'station' as const, id: s.code, code: s.code,
      title: s.name,
      sub: `${DIVISIONS[s.divCode]?.zone ?? ''} › ${DIVISIONS[s.divCode]?.name ?? ''} Division`,
    }))

  const lines: SearchResult[] = Object.entries(LINES)
    .map(([id, l]) => ({ id, l, sc: best(id, l.name) }))
    .filter(x => x.sc > 0)
    .map(({ id, l }) => ({
      kind: 'line' as const, id, code: id,
      title: l.name,
      sub: `${l.zone} · ${l.seq.length} stations`,
    }))

  const zones: SearchResult[] = ZONES
    .map(z => ({ z, sc: best(z.id, z.name) }))
    .filter(x => x.sc > 0)
    .map(({ z }) => ({
      kind: 'zone' as const, id: z.id, code: z.id,
      title: z.name,
      sub: `Headquarters: ${z.hq}`,
    }))

  const divs: SearchResult[] = Object.values(DIVISIONS)
    .map(d => ({ d, sc: best(d.id, d.name) }))
    .filter(x => x.sc > 0)
    .map(({ d }) => ({
      kind: 'division' as const, id: d.id, code: d.id,
      title: `${d.name} Division`,
      sub: `Zone: ${d.zone}`,
    }))

  const groups: Record<string, SearchResult[]> = {}
  if (trains.length) groups['Trains'] = trains
  if (stations.length) groups['Stations'] = stations
  if (lines.length) groups['Lines'] = lines
  if (zones.length) groups['Zones & networks'] = zones
  if (divs.length) groups['Divisions'] = divs
  return groups
}

const STATION_OPTS = Object.values(STATIONS).map(s => ({ value: s.code, label: `${s.name} (${s.code})` }))
const DAY_BETWEEN = ['Any', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIME_BETWEEN = ['Any time', 'Morning 04–12', 'Afternoon 12–18', 'Night 18–04']
const TYPE_BETWEEN = ['All types', 'Express', 'Superfast', 'Intercity', 'Passenger']

export function SearchPanel() {
  const [mode, setMode] = useState<SearchMode>('all')
  const [q, setQ] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('railyn-recent-searches') ?? '[]') } catch { return [] }
  })
  const [fromCode, setFromCode] = useState(STATION_OPTS[0].value)
  const [toCode, setToCode] = useState(STATION_OPTS[7].value)
  const [bDay, setBDay] = useState('Any')
  const [bTime, setBTime] = useState('Any time')
  const [bType, setBType] = useState('All types')
  const inputRef = useRef<HTMLInputElement>(null)
  const { replaceSheet } = useAppState()
  const isMobile = useIsMobile()

  useEffect(() => {
    localStorage.setItem('railyn-recent-searches', JSON.stringify(recentSearches))
  }, [recentSearches])

  // Auto-focus search input when panel opens
  useEffect(() => {
    if (mode === 'all') inputRef.current?.focus()
  }, [mode])

  const groups = buildResults(q)
  const hasResults = Object.values(groups).some(g => g.length > 0)
  const noResults = q.trim().length > 0 && !hasResults

  const openEntity = (r: SearchResult) => {
    if (r.kind === 'train' || r.kind === 'station' || r.kind === 'line') {
      replaceSheet({ kind: r.kind, id: r.id })
    }
    if (q.trim() && !recentSearches.includes(q.trim())) {
      setRecentSearches([q.trim(), ...recentSearches].slice(0, 8))
    }
  }

  const betweenTrains = trainsBetween(fromCode, toCode).filter(t => {
    if (bDay !== 'Any') {
      const idx = DAY_BETWEEN.indexOf(bDay) - 1
      if (!t.days.includes(idx)) return false
    }
    if (bType !== 'All types' && t.type !== bType) return false
    if (bTime !== 'Any time') {
      const stop = t.stops.find(s => s.code === fromCode)
      const dep = (stop?.dep ?? 0) % 1440
      if (bTime === 'Morning 04–12' && !(dep >= 4 * 60 && dep < 12 * 60)) return false
      if (bTime === 'Afternoon 12–18' && !(dep >= 12 * 60 && dep < 18 * 60)) return false
      if (bTime === 'Night 18–04' && !(dep >= 18 * 60 || dep < 4 * 60)) return false
    }
    return true
  })

  const swap = () => { const tmp = fromCode; setFromCode(toCode); setToCode(tmp) }

  if (isMobile) {
    return (
      <div style={{ position: 'absolute', inset: '0 0 0 0', zIndex: 25, background: '#f4f6f9', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        <div style={{ padding: '20px 16px 12px', flexShrink: 0, borderBottom: '1px solid #e6eaf0' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Search</h1>
          <Segmented
            options={[{ label: 'Everything', value: 'all' }, { label: 'Between stations', value: 'between' }]}
            value={mode}
            onChange={v => setMode(v as SearchMode)}
            fullWidth
          />
        </div>
        <div style={{ padding: '12px 16px 120px' }}>
          {mode === 'all' && renderAll()}
          {mode === 'between' && renderBetween()}
        </div>
      </div>
    )
  }

  // Desktop: sits inside the floating aside panel, no own header
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      {/* Mode toggle */}
      <div style={{ padding: '14px 16px 12px', flexShrink: 0, borderBottom: '1px solid rgba(15,23,34,.07)' }}>
        <Segmented
          options={[{ label: 'Everything', value: 'all' }, { label: 'Between stations', value: 'between' }]}
          value={mode}
          onChange={v => setMode(v as SearchMode)}
          fullWidth
        />
      </div>
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 28px' }}>
        {mode === 'all' && renderAll()}
        {mode === 'between' && renderBetween()}
      </div>
    </div>
  )

  function renderAll() {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 24, background: '#fff', boxShadow: '0 2px 8px rgba(15,23,34,.06)', color: '#7a8494', marginBottom: 12 }}>
          <Search size={18} strokeWidth={2} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Train number, name, station…"
            style={{ flex: 1, minWidth: 0, height: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: '#0f1722' }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ border: 0, background: 'none', cursor: 'pointer', color: '#7a8494', padding: 0, lineHeight: 1, fontSize: 16 }}>✕</button>
          )}
        </div>

        {!q.trim() && (
          <>
            {recentSearches.length > 0 && (
              <>
                <SectionHeader title="Recent" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recentSearches.map(r => (
                    <button
                      key={r}
                      onClick={() => setQ(r)}
                      style={{ height: 36, padding: '0 14px', borderRadius: 18, border: 0, background: '#fff', boxShadow: '0 1px 3px rgba(15,23,34,.06)', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#0f1722' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f4f8')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div style={{ fontSize: 12, color: '#7a8494', margin: '14px 2px 0', lineHeight: 1.5 }}>
              Matches trains, stations, zones, divisions and lines. Spelling mistakes are tolerated.
            </div>
          </>
        )}

        {Object.entries(groups).map(([groupLabel, items]) => (
          <div key={groupLabel}>
            <SectionHeader title={groupLabel} count={items.length} />
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
              {items.map(item => (
                <EntityRow
                  key={item.id}
                  kind={item.kind}
                  code={item.code}
                  title={item.title}
                  sub={item.sub}
                  onPress={() => openEntity(item)}
                />
              ))}
            </div>
          </div>
        ))}

        {noResults && (
          <div style={{ padding: '20px 2px', fontSize: 13, color: '#5b6574' }}>
            No matches for "{q}". Try a train number or station code.
          </div>
        )}
      </>
    )
  }

  function renderBetween() {
    return (
      <>
        <div style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: '4px 14px', boxShadow: '0 2px 8px rgba(15,23,34,.05)', marginBottom: 14 }}>
          {/* From */}
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, alignItems: 'center', minHeight: 58, borderBottom: '1px solid #eef1f5', paddingRight: 48 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, border: '2px dashed #0fa390' }} />
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 11, color: '#7a8494' }}>From</span>
              <select value={fromCode} onChange={e => setFromCode(e.target.value)} style={{ width: '100%', border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#0f1722', padding: '2px 0', appearance: 'none', cursor: 'pointer' }}>
                {STATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          {/* To */}
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, alignItems: 'center', minHeight: 58, paddingRight: 48 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: '#2b6ef2', boxShadow: '0 0 0 3px #cddcfd' }} />
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 11, color: '#7a8494' }}>To</span>
              <select value={toCode} onChange={e => setToCode(e.target.value)} style={{ width: '100%', border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#0f1722', padding: '2px 0', appearance: 'none', cursor: 'pointer' }}>
                {STATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          {/* Swap button */}
          <button
            onClick={swap}
            aria-label="Swap stations"
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 20, border: 0, background: '#e8f0fe', color: '#2b6ef2', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#cddcfd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#e8f0fe')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-4 4-4-4" /><path d="M17 20V4" />
              <path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
            </svg>
          </button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#5b6574', margin: '0 2px 6px' }}>Day</div>
        <ChipRow>{DAY_BETWEEN.map(d => <Chip key={d} label={d} active={bDay === d} onPress={() => setBDay(d)} />)}</ChipRow>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#5b6574', margin: '12px 2px 6px' }}>Departure</div>
        <ChipRow>{TIME_BETWEEN.map(d => <Chip key={d} label={d} active={bTime === d} onPress={() => setBTime(d)} />)}</ChipRow>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#5b6574', margin: '12px 2px 6px' }}>Train type</div>
        <ChipRow>{TYPE_BETWEEN.map(d => <Chip key={d} label={d} active={bType === d} onPress={() => setBType(d)} />)}</ChipRow>

        <SectionHeader title={betweenTrains.length ? `${betweenTrains.length} trains` : 'Trains'} count={betweenTrains.length} />

        {betweenTrains.map(t => {
          const fromStop = t.stops.find(s => s.code === fromCode)!
          const toStop = t.stops.find(s => s.code === toCode)!
          const durMins = (toStop.arr ?? 0) - (fromStop.dep ?? 0)
          const km = (toStop.km ?? 0) - (fromStop.km ?? 0)
          const hrs = Math.floor(durMins / 60)
          const mins = durMins % 60
          return (
            <div
              key={t.num}
              onClick={() => replaceSheet({ kind: 'train', id: t.num })}
              style={{ background: '#fff', borderRadius: 18, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', transition: 'box-shadow .15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #cddcfd')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.num} · {t.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 11, background: '#eef1f5', color: '#4a5463', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{fmTime(fromStop.dep)}</span>
                <div style={{ flex: 1, borderTop: '2px dashed #b8cdf8' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 24, padding: '0 8px', borderRadius: 12, background: '#e8f0fe', color: '#2b6ef2', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="16" height="16" x="4" y="3" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" />
                  </svg>
                  {hrs}h {String(mins).padStart(2, '0')}m
                </span>
                <div style={{ flex: 1, borderTop: '2px dashed #b8cdf8' }} />
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{fmTime(toStop.arr)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5b6574', marginTop: 5 }}>{km} km · {daysText(t.days)}</div>
            </div>
          )
        })}

        {betweenTrains.length === 0 && (
          <div style={{ padding: '16px 2px', fontSize: 13, color: '#5b6574' }}>No direct scheduled trains between these stations with the current filters.</div>
        )}

        {betweenTrains.length > 0 && (
          <button
            onClick={() => replaceSheet({ kind: 'between', id: `${fromCode}-${toCode}` })}
            style={{ width: '100%', height: 48, marginTop: 6, borderRadius: 14, border: 0, background: '#2b6ef2', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1f5ee0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2b6ef2')}
          >
            Show {betweenTrains.length} on map
          </button>
        )}
      </>
    )
  }
}
