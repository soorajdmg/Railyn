import { ChevronLeft, Map } from 'lucide-react'
import { useState } from 'react'
import { DIVISIONS, LINES, STATIONS, TRAINS, ZONES } from '../../data/mockData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAppState } from '../../store/appState'
import { EntityRow } from '../ui/EntityRow'
import { SectionHeader } from '../ui/SectionHeader'

type ExploreItem =
  | { type: 'root' }
  | { type: 'zone'; id: string }
  | { type: 'division'; id: string }

export function ExplorePanel() {
  const [stack, setStack] = useState<ExploreItem[]>([{ type: 'root' }])
  const { showToast } = useAppState()
  const isMobile = useIsMobile()

  const mobileStyle: React.CSSProperties = { position: 'absolute', inset: '0 0 0 0', zIndex: 25, background: '#f4f6f9', overflowY: 'auto', display: 'flex', flexDirection: 'column' }
  const desktopStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }
  const outerStyle = isMobile ? mobileStyle : desktopStyle

  const current = stack[stack.length - 1]

  const push = (item: ExploreItem) => setStack([...stack, item])
  const pop = () => setStack(stack.slice(0, -1))

  const zoneStats = (zoneId: string) => {
    const divs = Object.values(DIVISIONS).filter(d => d.zone === zoneId)
    const stations = Object.values(STATIONS).filter(s => divs.some(d => d.id === s.divCode))
    const lines = Object.values(LINES).filter(l => l.zone === zoneId)
    const trains = Object.values(TRAINS).filter(t => stations.some(s => s.code === t.src || s.code === t.dst))
    return { divs: divs.length, stations: stations.length, lines: lines.length, trains: trains.length }
  }

  const divStats = (divId: string) => {
    const stations = Object.values(STATIONS).filter(s => s.divCode === divId)
    const junctions = stations.filter(s => s.isJunction).length
    const lines = Object.values(LINES).filter(l => l.seq.some(c => stations.some(s => s.code === c)))
    const trains = Object.values(TRAINS).filter(t => stations.some(s => s.code === t.src || s.code === t.dst))
    return { stations: stations.length, junctions, lines: lines.length, trains: trains.length }
  }

  const scrollBody = isMobile
    ? { padding: '12px 16px 120px' }
    : { flex: 1, overflowY: 'auto' as const, padding: '12px 16px 28px' }

  if (current.type === 'root') {
    const covered = ZONES.filter(z => z.covered && !z.org)
    const orgs = ZONES.filter(z => z.org)
    const uncovered = ZONES.filter(z => !z.covered && !z.org)

    return (
      <div style={outerStyle}>
        {isMobile && (
          <div style={{ padding: '20px 16px 12px', flexShrink: 0, borderBottom: '1px solid #e6eaf0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2b6ef2', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Explore</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>Administrative hierarchy</h1>
          </div>
        )}
        {!isMobile && (
          <div style={{ padding: '14px 16px 12px', flexShrink: 0, borderBottom: '1px solid rgba(15,23,34,.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2b6ef2', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Explore</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f1722', letterSpacing: '-0.01em' }}>Administrative hierarchy</div>
          </div>
        )}
        <div style={scrollBody}>
          <SectionHeader title="Railway zones" />
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {covered.map(z => (
              <EntityRow key={z.id} kind="zone" code={z.id} title={z.name} sub={`Headquarters: ${z.hq}`} onPress={() => push({ type: 'zone', id: z.id })} />
            ))}
            {uncovered.map(z => (
              <EntityRow key={z.id} kind="zone" code={z.id} title={z.name} sub="Not yet covered" onPress={() => showToast('Not yet covered')} dimmed />
            ))}
          </div>

          <SectionHeader title="Separately managed networks" />
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {orgs.map(z => (
              <EntityRow key={z.id} kind="zone" code={z.id} title={z.name} sub={`Headquarters: ${z.hq}`} onPress={() => push({ type: 'zone', id: z.id })} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (current.type === 'zone') {
    const zone = ZONES.find(z => z.id === current.id)
    if (!zone) return null
    const stats = zoneStats(current.id)
    const zoneDivs = Object.values(DIVISIONS).filter(d => d.zone === current.id)

    return (
      <div style={outerStyle}>
        <div style={{ padding: '14px 16px 12px', flexShrink: 0, borderBottom: isMobile ? '1px solid #e6eaf0' : '1px solid rgba(15,23,34,.07)' }}>
          <button onClick={pop} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 3, border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: 0, marginLeft: -4, cursor: 'pointer', color: '#2b6ef2', marginBottom: 6 }}>
            <ChevronLeft size={16} strokeWidth={2} />Explore
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e59a1a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            {zone.org ? 'Separately managed network' : 'Railway zone'}
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 18, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{zone.name}</h1>
        </div>
        <div style={scrollBody}>
          {/* Stat card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', background: '#fff', borderRadius: 18, padding: '12px 0', boxShadow: '0 2px 8px rgba(15,23,34,.05)', marginBottom: 14 }}>
            {[
              { n: stats.divs, l: zone.org ? 'Regions' : 'Divisions' },
              { n: stats.stations, l: 'Stations' },
              { n: stats.lines, l: 'Lines' },
              { n: stats.trains, l: 'Trains' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '0 10px', borderLeft: i > 0 ? '1px solid #eef1f5' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.n}</div>
                <div style={{ fontSize: 11, color: '#5b6574' }}>{t.l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#5b6574', margin: '-6px 2px 14px' }}>Headquarters: {zone.hq}</div>

          <button
            style={{ width: '100%', height: 44, marginBottom: 14, borderRadius: 13, border: 0, background: '#e8f0fe', color: '#2b6ef2', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d8e5fd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#e8f0fe')}
          >
            <Map size={16} strokeWidth={2} />View on map
          </button>

          <SectionHeader title={zone.org ? 'Regions' : 'Divisions'} count={zoneDivs.length} />
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {zoneDivs.map(d => (
              <EntityRow
                key={d.id}
                kind="division"
                code={d.id}
                title={`${d.name} Division`}
                sub={`Headquarters: ${d.hq}`}
                onPress={() => push({ type: 'division', id: d.id })}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (current.type === 'division') {
    const div = DIVISIONS[current.id]
    if (!div) return null
    const stats = divStats(current.id)
    const divStations = Object.values(STATIONS).filter(s => s.divCode === current.id)
    const divLines = Object.values(LINES).filter(l => l.seq.some(c => divStations.some(s => s.code === c)))
    const zone = ZONES.find(z => z.id === div.zone)
    const parentLabel = zone?.name ?? div.zone

    return (
      <div style={outerStyle}>
        <div style={{ padding: '14px 16px 12px', flexShrink: 0, borderBottom: isMobile ? '1px solid #e6eaf0' : '1px solid rgba(15,23,34,.07)' }}>
          <button onClick={pop} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 3, border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: 0, marginLeft: -4, cursor: 'pointer', color: '#2b6ef2', marginBottom: 6 }}>
            <ChevronLeft size={16} strokeWidth={2} />{parentLabel}
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e59a1a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Division</div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 18, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{div.name} Division</h1>
        </div>
        <div style={scrollBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', background: '#fff', borderRadius: 18, padding: '12px 0', boxShadow: '0 2px 8px rgba(15,23,34,.05)', marginBottom: 14 }}>
            {[
              { n: stats.stations, l: 'Stations' },
              { n: stats.junctions, l: 'Junctions' },
              { n: stats.lines, l: 'Lines' },
              { n: stats.trains, l: 'Trains' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '0 10px', borderLeft: i > 0 ? '1px solid #eef1f5' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.n}</div>
                <div style={{ fontSize: 11, color: '#5b6574' }}>{t.l}</div>
              </div>
            ))}
          </div>

          <SectionHeader title="Lines & corridors" count={divLines.length} />
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {divLines.length === 0 ? (
              <div style={{ padding: '14px 12px', fontSize: 13, color: '#5b6574' }}>No lines in this division.</div>
            ) : (
              divLines.map(l => (
                <EntityRow
                  key={l.id}
                  kind="line"
                  code={l.id}
                  title={l.name}
                  sub={`${l.seq.length} stations`}
                  onPress={() => {}}
                />
              ))
            )}
          </div>

          <SectionHeader title="Stations" count={divStations.length} />
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {divStations.map(s => (
              <EntityRow
                key={s.code}
                kind="station"
                code={s.code}
                title={s.name}
                sub={s.isJunction ? 'Junction' : 'Station'}
                onPress={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
