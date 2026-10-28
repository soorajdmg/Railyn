import { Clock } from 'lucide-react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { KVCard } from '../ui/KVCard'
import { SectionHeader } from '../ui/SectionHeader'

export function InfoPanel() {
  const isMobile = useIsMobile()
  return (
    <div style={isMobile
      ? { position: 'absolute', inset: '0 0 0 0', zIndex: 25, background: '#f4f6f9', overflowY: 'auto', display: 'flex', flexDirection: 'column' }
      : { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }
    }>
      {/* Mobile header only */}
      {isMobile && (
        <div style={{ padding: '20px 16px 12px', flexShrink: 0, borderBottom: '1px solid #e6eaf0' }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Info</h1>
        </div>
      )}

      {/* Scrollable body */}
      <div style={isMobile ? { padding: '12px 16px 120px' } : { flex: 1, overflowY: 'auto', padding: '12px 16px 28px' }}>
        {/* Scheduled not live card */}
        <div style={{ padding: 18, borderRadius: 20, background: '#2b6ef2', color: '#fff', marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', marginBottom: 10 }}>
            <Clock size={18} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Scheduled, not live</div>
          <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            Railyn shows planned routes and timetabled times. It does not show where a train is right now, delays, cancellations or platform changes.
          </div>
        </div>

        {/* Coverage */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 8px' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Coverage</span>
          <span style={{ height: 22, padding: '0 9px', borderRadius: 11, background: '#dff5f0', color: '#0b7f70', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>Prototype</span>
        </div>
        <KVCard items={[
          { key: 'Region', value: 'Kerala + Konkan Railway corridor' },
          { key: 'Stations', value: '21' },
          { key: 'Lines', value: '6' },
          { key: 'Train services', value: '9' },
          { key: 'Last import', value: 'Oct 2026' },
          { key: 'Timetable version', value: '2026.10.2' },
        ]} />

        <SectionHeader title="Data sources" />
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
          {[
            { title: 'OpenStreetMap', lic: 'ODbL', sub: 'Map data © OpenStreetMap contributors' },
            { title: 'OpenFreeMap', lic: 'Free', sub: 'Vector tiles for the base map (Positron style)' },
            { title: 'Indian Railways timetable', lic: 'Sample', sub: 'Placeholder data — not for navigation. Replace with official timetable.' },
          ].map((x, i, arr) => (
            <div key={i} style={{ padding: '10px 12px', borderBottom: i < arr.length - 1 ? '1px solid #eef1f5' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{x.title}</span>
                <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: '#eef1f5', color: '#4a5463', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>{x.lic}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5b6574', marginTop: 2 }}>{x.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
