import { Bookmark, Compass, Info, Map, Search } from 'lucide-react'
import type { Tab } from '../../store/appState'
import { useAppState } from '../../store/appState'

interface NavItem {
  tab: Tab
  label: string
  icon: React.ReactNode
}

const ITEMS: NavItem[] = [
  { tab: 'map', label: 'Map', icon: <Map size={20} strokeWidth={2} /> },
  { tab: 'search', label: 'Search', icon: <Search size={20} strokeWidth={2} /> },
  { tab: 'explore', label: 'Explore', icon: <Compass size={20} strokeWidth={2} /> },
  { tab: 'saved', label: 'Saved', icon: <Bookmark size={20} strokeWidth={2} /> },
  { tab: 'info', label: 'Info', icon: <Info size={20} strokeWidth={2} /> },
]

export function SideNav() {
  const { tab, setTab } = useAppState()

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 30,
        width: 64,
        height: '100%',
        background: '#0c111a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        gap: 4,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,.06)',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#2b6ef2',
          display: 'grid',
          placeItems: 'center',
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6l6 6-6 6" />
        </svg>
      </div>

      {/* Nav items */}
      {ITEMS.map(item => {
        const active = tab === item.tab
        return (
          <button
            key={item.tab}
            aria-label={item.label}
            title={item.label}
            onClick={() => setTab(item.tab)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 0,
              background: active ? 'rgba(110,160,255,.18)' : 'transparent',
              color: active ? '#6ea0ff' : 'rgba(255,255,255,.55)',
              cursor: 'pointer',
              transition: 'background .15s, color .15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.07)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.9)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.55)'
              }
            }}
          >
            {item.icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
