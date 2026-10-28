import { Layers, Navigation } from 'lucide-react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAppState } from '../../store/appState'
import { Switch } from '../ui/Switch'

// Left panel occupies: left:14, width:460 → right edge at 474px → gap starts at 488px
// Right panel occupies: right:14, width:420 → left edge at calc(100% - 434px)
// Desktop overlays are positioned in the exposed map strip between the two panels

export function MapOverlays({ onSearchClick, hasSheet = false }: { onSearchClick: () => void; hasSheet?: boolean }) {
  const { layersOpen, toggleLayers, coverageOutline, toggleCoverage, stationLabels, toggleLabels } = useAppState()
  const isMobile = useIsMobile()
  // Right panel: right:14 + width:420 + 14 gap = 448 from right edge
  const rightOffset = !isMobile && hasSheet ? 448 : 14

  if (isMobile) {
    return (
      <>
        {/* Mobile search pill — full width at top */}
        <div
          onClick={onSearchClick}
          style={{
            position: 'absolute', zIndex: 15,
            top: 14, left: 14, right: 14,
            height: 54,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 8px 0 16px',
            background: '#fff',
            borderRadius: 27,
            boxShadow: '0 4px 16px rgba(15,23,34,.12)',
            cursor: 'text', color: '#0f1722',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span style={{ flex: 1, fontSize: 14, color: '#7a8494' }}>Train, station, line…</span>
          <span style={{ height: 32, padding: '0 12px', borderRadius: 16, background: '#e8f0fe', color: '#2b6ef2', display: 'inline-flex', alignItems: 'center', fontWeight: 700, fontSize: 13 }}>
            Railyn
          </span>
        </div>

        {/* Mobile coverage chip + attribution */}
        <div style={{ position: 'absolute', zIndex: 14, top: 78, left: 14, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 28, padding: '0 11px', borderRadius: 14, background: 'rgba(255,255,255,.92)', boxShadow: '0 2px 6px rgba(15,23,34,.08)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, border: '1.5px dashed #0fa390' }} />
            Coverage: Kerala + Konkan
          </div>
          <div style={{ fontSize: 9, padding: '3px 7px', borderRadius: 6, background: 'rgba(255,255,255,.8)', color: '#4a5463', whiteSpace: 'nowrap' }}>
            © OpenStreetMap contributors · OpenFreeMap
          </div>
        </div>

        {/* Mobile right controls */}
        <div style={{ position: 'absolute', zIndex: 14, top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={toggleLayers}
            aria-label="Layers and legend"
            style={{ width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', border: 0, background: layersOpen ? '#2b6ef2' : '#fff', color: layersOpen ? '#fff' : '#0f1722', boxShadow: '0 4px 14px rgba(15,23,34,.12)', cursor: 'pointer', transition: 'background .15s, color .15s' }}
          >
            <Layers size={18} strokeWidth={2} />
          </button>
          <button
            aria-label="Locate me"
            style={{ width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', border: 0, background: '#fff', color: '#2b6ef2', boxShadow: '0 4px 14px rgba(15,23,34,.12)', cursor: 'pointer' }}
          >
            <Navigation size={17} strokeWidth={2} />
          </button>
        </div>

        {/* Mobile layers popover */}
        {layersOpen && (
          <div style={{ position: 'absolute', zIndex: 16, top: 14, right: 66, width: 232, background: '#fff', borderRadius: 20, boxShadow: '0 16px 40px rgba(15,23,34,.18)', padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
            <LegendContent coverageOutline={coverageOutline} toggleCoverage={toggleCoverage} stationLabels={stationLabels} toggleLabels={toggleLabels} />
          </div>
        )}
      </>
    )
  }

  // ── Desktop overlays ─────────────────────────────────────────────────────────
  // On desktop the map is full-bleed; left panel sits at left:14–474, right panel at right:14–434.
  // We place overlays in the visible strip in between.

  return (
    <>
      {/* Desktop search pill — centered in gap between panels */}
      <div
        onClick={onSearchClick}
        style={{
          position: 'absolute', zIndex: 15,
          top: 28,
          left: 488,
          right: rightOffset + 8,
          maxWidth: 380,
          margin: '0 auto',
          height: 48,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 8px 0 16px',
          background: 'rgba(255,255,255,.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 24,
          boxShadow: '0 4px 16px rgba(15,23,34,.14)',
          cursor: 'text', color: '#0f1722',
        } as React.CSSProperties}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span style={{ flex: 1, fontSize: 13, color: '#7a8494' }}>Train, station, line…</span>
        <span style={{ height: 28, padding: '0 10px', borderRadius: 14, background: '#e8f0fe', color: '#2b6ef2', display: 'inline-flex', alignItems: 'center', fontWeight: 700, fontSize: 12 }}>
          Railyn
        </span>
      </div>

      {/* Desktop right controls — at right edge of gap */}
      <div style={{ position: 'absolute', zIndex: 14, top: 28, right: rightOffset + 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={toggleLayers}
          aria-label="Layers and legend"
          style={{ width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', border: 0, background: layersOpen ? '#2b6ef2' : 'rgba(255,255,255,.95)', color: layersOpen ? '#fff' : '#0f1722', boxShadow: '0 4px 14px rgba(15,23,34,.12)', cursor: 'pointer', transition: 'background .15s, color .15s', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as React.CSSProperties}
        >
          <Layers size={18} strokeWidth={2} />
        </button>
        <button
          aria-label="Locate me"
          style={{ width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', border: 0, background: 'rgba(255,255,255,.95)', color: '#2b6ef2', boxShadow: '0 4px 14px rgba(15,23,34,.12)', cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as React.CSSProperties}
        >
          <Navigation size={17} strokeWidth={2} />
        </button>
      </div>

      {/* Desktop layers popover */}
      {layersOpen && (
        <div style={{ position: 'absolute', zIndex: 16, top: 28, right: rightOffset + 60, width: 232, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 20, boxShadow: '0 16px 40px rgba(15,23,34,.18)', padding: 14, display: 'flex', flexDirection: 'column', gap: 9 } as React.CSSProperties}>
          <LegendContent coverageOutline={coverageOutline} toggleCoverage={toggleCoverage} stationLabels={stationLabels} toggleLabels={toggleLabels} />
        </div>
      )}

      {/* Desktop coverage chip + attribution — bottom of exposed map gap */}
      <div style={{ position: 'absolute', zIndex: 14, bottom: 28, left: 488, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 26, padding: '0 10px', borderRadius: 13, background: 'rgba(255,255,255,.88)', boxShadow: '0 2px 6px rgba(15,23,34,.08)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, border: '1.5px dashed #0fa390' }} />
          Coverage: Kerala + Konkan
        </div>
        <div style={{ fontSize: 9, padding: '3px 7px', borderRadius: 6, background: 'rgba(255,255,255,.75)', color: '#4a5463', whiteSpace: 'nowrap' }}>
          © OpenStreetMap contributors · OpenFreeMap
        </div>
      </div>
    </>
  )
}

function LegendContent({ coverageOutline, toggleCoverage, stationLabels, toggleLabels }: {
  coverageOutline: boolean
  toggleCoverage: () => void
  stationLabels: boolean
  toggleLabels: () => void
}) {
  return (
    <>
      <span style={{ fontSize: 14, fontWeight: 700 }}>Legend</span>
      <LegendItem icon={<div style={{ width: 12, height: 12, borderRadius: 6, border: '2px solid #3b4657', background: '#fff' }} />} label="Junction" />
      <LegendItem icon={<div style={{ width: 12, display: 'grid', placeItems: 'center' }}><div style={{ width: 8, height: 8, borderRadius: 4, border: '1.5px solid #3b4657' }} /></div>} label="Station" extra="zoom in" />
      <LegendItem icon={<div style={{ width: 12, height: 2.5, borderRadius: 2, background: '#3b4657' }} />} label="Railway line" />
      <LegendItem icon={<div style={{ width: 12, borderTop: '2.5px dotted #9aa3b2' }} />} label="Konkan Railway" />
      <LegendItem icon={<div style={{ width: 12, height: 4, borderRadius: 2, background: '#2b6ef2', boxShadow: '0 0 5px rgba(43,110,242,.6)' }} />} label="Selected route" />
      <LegendItem icon={<div style={{ width: 12, display: 'grid', placeItems: 'center' }}><div style={{ width: 10, height: 10, borderRadius: 5, background: '#0fa390' }} /></div>} label="Origin" />
      <LegendItem icon={<div style={{ width: 12, height: 4, borderRadius: 2, background: '#7a5af5' }} />} label="Line view" />
      <div style={{ height: 1, background: '#eef1f5', margin: '1px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
        <span style={{ fontSize: 13 }}>Coverage outline</span>
        <Switch on={coverageOutline} onToggle={toggleCoverage} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
        <span style={{ fontSize: 13 }}>Station labels</span>
        <Switch on={stationLabels} onToggle={toggleLabels} />
      </div>
    </>
  )
}

function LegendItem({ icon, label, extra }: { icon: React.ReactNode; label: string; extra?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
      {icon}
      {label}
      {extra && <span style={{ color: '#7a8494', fontSize: 11 }}>{extra}</span>}
    </div>
  )
}
