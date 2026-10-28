import { useIsMobile } from '../../hooks/useIsMobile'
import { useAppState } from '../../store/appState'
import { EntityRow } from '../ui/EntityRow'
import { SectionHeader } from '../ui/SectionHeader'

export function SavedPanel() {
  const { favourites, recentlyViewed, replaceSheet } = useAppState()
  const isMobile = useIsMobile()

  const openEntity = (kind: 'train' | 'station' | 'line', id: string) => {
    replaceSheet({ kind, id })
  }

  return (
    <div style={isMobile
      ? { position: 'absolute', inset: '0 0 0 0', zIndex: 25, background: '#f4f6f9', overflowY: 'auto', display: 'flex', flexDirection: 'column' }
      : { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }
    }>
      {/* Mobile header only */}
      {isMobile && (
        <div style={{ padding: '20px 16px 12px', flexShrink: 0, borderBottom: '1px solid #e6eaf0' }}>
          <h1 style={{ margin: '0 0 3px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Saved</h1>
          <div style={{ fontSize: 12, color: '#5b6574' }}>Stored on this device. No account needed.</div>
        </div>
      )}
      {!isMobile && (
        <div style={{ padding: '14px 16px 10px', flexShrink: 0, borderBottom: '1px solid rgba(15,23,34,.07)' }}>
          <div style={{ fontSize: 12, color: '#5b6574' }}>Stored on this device. No account needed.</div>
        </div>
      )}

      {/* Scrollable body */}
      <div style={isMobile ? { padding: '12px 16px 120px' } : { flex: 1, overflowY: 'auto', padding: '12px 16px 28px' }}>
        <SectionHeader title="Favourites" count={favourites.length || undefined} />
        {favourites.length === 0 ? (
          <div style={{ padding: '16px 14px', borderRadius: 18, background: '#fff', fontSize: 13, color: '#5b6574' }}>
            Nothing saved yet. Click the bookmark on any train or station.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {favourites.map(e => (
              <EntityRow
                key={`${e.kind}-${e.id}`}
                kind={e.kind}
                code={e.code}
                title={e.title}
                sub={e.sub}
                onPress={() => openEntity(e.kind, e.id)}
              />
            ))}
          </div>
        )}

        <SectionHeader title="Recently viewed" count={recentlyViewed.length || undefined} />
        {recentlyViewed.length === 0 ? (
          <div style={{ padding: '16px 14px', borderRadius: 18, background: '#fff', fontSize: 13, color: '#5b6574' }}>
            Trains, stations and lines you open will appear here.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            {recentlyViewed.map(e => (
              <EntityRow
                key={`${e.kind}-${e.id}`}
                kind={e.kind}
                code={e.code}
                title={e.title}
                sub={e.sub}
                onPress={() => openEntity(e.kind, e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
