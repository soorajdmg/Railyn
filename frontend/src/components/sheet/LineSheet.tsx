import { LINES, STATIONS, TRAINS, lineKm, lineStopKms } from '../../data/mockData'
import { useAppState } from '../../store/appState'
import { EntityRow } from '../ui/EntityRow'
import { KVCard } from '../ui/KVCard'
import { SectionHeader } from '../ui/SectionHeader'
import { BottomSheet } from './BottomSheet'

interface Props {
  lineId: string
}

export function LineSheet({ lineId }: Props) {
  const { pushSheet } = useAppState()

  const line = LINES[lineId]
  if (!line) return null

  const kmList = lineStopKms(lineId)
  const totalKm = lineKm(lineId)

  const trainsOnLine = Object.values(TRAINS).filter(t => {
    const tStations = t.stops.map(s => s.code)
    return line.seq.some(c => tStations.includes(c))
  })

  const firstSt = STATIONS[line.seq[0]]
  const lastSt = STATIONS[line.seq[line.seq.length - 1]]

  return (
    <BottomSheet
      kind="line"
      kicker="Railway Line"
      title={line.name}
      code={lineId}
      sub={`${firstSt?.name ?? ''} → ${lastSt?.name ?? ''}`}
    >
      <div style={{ marginTop: 8 }}>
        <KVCard items={[
          { key: 'Network', value: line.zone === 'KR' ? 'Konkan Railway' : 'Southern Railway' },
          { key: 'Length', value: `${totalKm} km` },
          { key: 'Stations', value: `${line.seq.length}` },
          { key: 'Ends', value: `${firstSt?.name ?? ''} – ${lastSt?.name ?? ''}` },
        ]} />
      </div>

      <SectionHeader title="Station sequence" />
      <div style={{ background: '#f1f4f8', borderRadius: 18, padding: '4px 12px' }}>
        {line.seq.map((code, i) => {
          const st = STATIONS[code]
          const isFirst = i === 0
          const isLast = i === line.seq.length - 1
          return (
            <div
              key={code}
              onClick={() => pushSheet({ kind: 'station', id: code })}
              className="row-hover-2"
              style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', gap: '0 8px', alignItems: 'center', minHeight: 48, cursor: 'pointer', borderRadius: 8, padding: '0 2px' }}
            >
              <div style={{ position: 'relative', alignSelf: 'stretch', display: 'grid', placeItems: 'center' }}>
                {!isFirst && <div style={{ position: 'absolute', left: 8, top: 0, bottom: '50%', borderLeft: '2px dashed #b8cdf8' }} />}
                {!isLast && <div style={{ position: 'absolute', left: 8, top: '50%', bottom: 0, borderLeft: '2px dashed #b8cdf8' }} />}
                <div style={{ position: 'relative', width: 12, height: 12, borderRadius: 6, background: '#fff', border: '2.5px solid #2b6ef2' }} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{st?.name ?? code}</span>
                {' '}
                <span style={{ fontWeight: 500, color: '#7a8494', fontSize: 11 }}>{code}</span>
              </div>
              <span style={{ fontSize: 12, color: '#5b6574' }}>{kmList[i]} km</span>
            </div>
          )
        })}
      </div>

      <SectionHeader title="Trains along this line" />
      <div style={{ background: '#f1f4f8', borderRadius: 18, overflow: 'hidden' }}>
        {trainsOnLine.length === 0 ? (
          <div style={{ padding: '14px 12px', fontSize: 13, color: '#5b6574' }}>No trains found.</div>
        ) : (
          trainsOnLine.map(t => (
            <EntityRow
              key={t.num}
              kind="train"
              code={t.num}
              title={t.name}
              sub={`${t.type} · ${STATIONS[t.src]?.name ?? t.src} → ${STATIONS[t.dst]?.name ?? t.dst}`}
              onPress={() => pushSheet({ kind: 'train', id: t.num })}
              onSurface2
            />
          ))
        )}
      </div>
    </BottomSheet>
  )
}
