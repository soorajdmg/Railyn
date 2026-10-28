import type { Tab } from '../../store/appState'
import { useAppState } from '../../store/appState'

// Section labels
const SECTION_LABELS: Record<Tab, string> = {
  map: 'Railyn',
  search: 'Search',
  explore: 'Explore',
  saved: 'Saved',
  info: 'Info',
}

// Primary 4-tile nav items (trains / stations / lines / between → mapped to our tabs)
interface TileItem {
  tab: Tab
  label: string
  icon: React.ReactNode
}

const TILES: TileItem[] = [
  {
    tab: 'search',
    label: 'Trains',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="16" x="4" y="3" rx="2" />
        <path d="M4 11h16" />
        <path d="M12 3v8" />
        <path d="m8 19-2 3" />
        <path d="m18 22-2-3" />
        <path d="M8 15h.01" />
        <path d="M16 15h.01" />
      </svg>
    ),
  },
  {
    tab: 'explore',
    label: 'Stations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    tab: 'map',
    label: 'Lines',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
      </svg>
    ),
  },
  {
    tab: 'search',
    label: 'Between',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3 4 7l4 4" />
        <path d="M4 7h16" />
        <path d="m16 21 4-4-4-4" />
        <path d="M20 17H4" />
      </svg>
    ),
  },
]

// Secondary pill nav items
interface PillItem {
  tab: Tab
  label: string
}

const PILLS: PillItem[] = [
  { tab: 'map', label: 'Overview' },
  { tab: 'explore', label: 'Zones' },
  { tab: 'saved', label: 'Saved' },
  { tab: 'info', label: 'Info' },
]

export function DesktopNav() {
  const { tab, setTab } = useAppState()
  const isOverview = tab === 'map'
  const panelTitle = isOverview ? 'Railyn' : SECTION_LABELS[tab]

  // Tile active: search = trains/between, explore = stations, map = lines
  const tileActive = (t: TileItem) => {
    if (t.label === 'Trains' && tab === 'search') return true
    if (t.label === 'Between' && tab === 'search') return true
    if (t.label === 'Stations' && tab === 'explore') return true
    if (t.label === 'Lines' && tab === 'map') return true
    return false
  }

  return (
    <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
      {/* Header row: R badge + title + close */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11,
          background: '#2b6ef2', color: '#fff',
          display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: 16, flexShrink: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          R
        </div>
        <span style={{ flex: 1, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {panelTitle}
        </span>
        {!isOverview && (
          <button
            onClick={() => setTab('map')}
            aria-label="Back to overview"
            title="Back to overview"
            style={{
              width: 36, height: 36, borderRadius: 18,
              border: 0, background: 'rgba(15,23,34,.07)',
              color: '#3b4657', display: 'grid', placeItems: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(15,23,34,.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(15,23,34,.07)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 4-tile primary nav grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 6,
        marginBottom: 10,
      }}>
        {TILES.map(tile => {
          const active = tileActive(tile)
          return (
            <button
              key={tile.label}
              onClick={() => setTab(tile.tab)}
              aria-label={tile.label}
              title={tile.label}
              style={{
                height: 46, border: 0, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7,
                background: active ? '#2b6ef2' : 'rgba(15,23,34,.06)',
                color: active ? '#fff' : '#0f1722',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'rgba(15,23,34,.10)'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'rgba(15,23,34,.06)'
              }}
            >
              {tile.icon}
              <span>{tile.label}</span>
            </button>
          )
        })}
      </div>

      {/* Pill secondary nav row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {PILLS.map(pill => {
          const active = tab === pill.tab
          return (
            <button
              key={pill.label}
              onClick={() => setTab(pill.tab)}
              style={{
                height: 36, padding: '0 14px',
                borderRadius: 18,
                border: '1px solid #e3e7ee',
                background: active ? '#0f1722' : '#fff',
                color: active ? '#fff' : '#0f1722',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(15,23,34,.05)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(15,23,34,.07)', margin: '0 -16px 0' }} />
    </div>
  )
}
