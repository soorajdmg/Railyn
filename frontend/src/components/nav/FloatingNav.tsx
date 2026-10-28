import { Bookmark, Compass, Info, Map, Search } from 'lucide-react'
import type { Tab } from '../../store/appState'
import { useAppState } from '../../store/appState'

interface NavItem {
  tab: Tab
  label: string
  icon: React.ReactNode
}

const ITEMS: NavItem[] = [
  { tab: 'map', label: 'map', icon: <Map size={22} strokeWidth={2} /> },
  { tab: 'search', label: 'search', icon: <Search size={22} strokeWidth={2} /> },
  { tab: 'explore', label: 'explore', icon: <Compass size={22} strokeWidth={2} /> },
  { tab: 'saved', label: 'saved', icon: <Bookmark size={22} strokeWidth={2} /> },
  { tab: 'info', label: 'info', icon: <Info size={22} strokeWidth={2} /> },
]

export function FloatingNav() {
  const { tab, setTab } = useAppState()

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 26,
        height: 64,
        padding: '0 8px',
        borderRadius: 32,
        background: '#0c111a',
        boxShadow: '0 12px 32px rgba(12,17,26,.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        pointerEvents: 'auto',
      }}
    >
      {ITEMS.map(item => {
        const active = tab === item.tab
        return (
          <button
            key={item.tab}
            aria-label={item.label}
            onClick={() => setTab(item.tab)}
            style={{
              width: 52,
              height: 48,
              borderRadius: 24,
              display: 'grid',
              placeItems: 'center',
              border: 0,
              background: active ? 'rgba(110,160,255,.18)' : 'transparent',
              color: active ? '#6ea0ff' : 'rgba(255,255,255,.72)',
              cursor: 'pointer',
              transition: 'background .2s, color .2s',
            }}
          >
            {item.icon}
          </button>
        )
      })}
    </div>
  )
}
