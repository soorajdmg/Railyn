import { STATIONS, TRAINS } from '../../data/mockData'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAppState } from '../../store/appState'
import { MapOverlays } from '../map/MapOverlays'
import { RailwayMap } from '../map/RailwayMap'
import { FloatingNav } from '../nav/FloatingNav'
import { DesktopNav } from '../nav/DesktopNav'
import { ExplorePanel } from '../panels/ExplorePanel'
import { InfoPanel } from '../panels/InfoPanel'
import { SavedPanel } from '../panels/SavedPanel'
import { SearchPanel } from '../panels/SearchPanel'
import { LineSheet } from '../sheet/LineSheet'
import { StationSheet } from '../sheet/StationSheet'
import { TrainSheet } from '../sheet/TrainSheet'
import { Toast } from '../ui/Toast'

// Compute route coords for active sheet entity
function useActiveRoute() {
  const sheetStack = useAppState(s => s.sheetStack)
  const top = sheetStack[sheetStack.length - 1]
  if (!top) return { routeCoords: undefined, routeColor: '#2b6ef2' as string, selectedCode: undefined, originCode: undefined }

  if (top.kind === 'train') {
    const train = TRAINS[top.id]
    if (train) {
      const coords = train.stops
        .filter(s => STATIONS[s.code])
        .map(s => [STATIONS[s.code].lon, STATIONS[s.code].lat])
      return { routeCoords: coords, routeColor: '#2b6ef2', selectedCode: train.dst, originCode: train.src }
    }
  }
  if (top.kind === 'station') {
    const st = STATIONS[top.id]
    if (st) return { routeCoords: undefined, routeColor: '#2b6ef2', selectedCode: top.id, originCode: undefined }
  }
  if (top.kind === 'line') {
    return { routeCoords: undefined, routeColor: '#7a5af5', selectedCode: undefined, originCode: undefined }
  }
  return { routeCoords: undefined, routeColor: '#2b6ef2' as string, selectedCode: undefined, originCode: undefined }
}

export default function AppLayout() {
  const { tab, setTab, sheetStack } = useAppState()
  const { routeCoords, routeColor, selectedCode, originCode } = useActiveRoute()
  const isMobile = useIsMobile()

  const isMap = tab === 'map'
  const hasSheet = sheetStack.length > 0
  const top = sheetStack[sheetStack.length - 1]

  const sheetContent = hasSheet && top ? (
    top.kind === 'train' ? <TrainSheet trainNum={top.id} /> :
    top.kind === 'station' ? <StationSheet stationCode={top.id} /> :
    top.kind === 'line' ? <LineSheet lineId={top.id} /> :
    null
  ) : null

  // ── Mobile layout ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        background: '#f4f6f9', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif", color: '#0f1722',
        WebkitFontSmoothing: 'antialiased',
      } as React.CSSProperties}>
        <RailwayMap routeCoords={routeCoords} routeColor={routeColor} selectedCode={selectedCode} originCode={originCode} />
        {isMap && <MapOverlays onSearchClick={() => setTab('search')} />}
        {tab === 'search' && <SearchPanel />}
        {tab === 'explore' && <ExplorePanel />}
        {tab === 'saved' && <SavedPanel />}
        {tab === 'info' && <InfoPanel />}
        {sheetContent}
        <FloatingNav />
        <Toast />
      </div>
    )
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  // Map fills the entire viewport; panels float over it as absolute cards
  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif", color: '#0f1722',
      WebkitFontSmoothing: 'antialiased',
      minWidth: 1100, minHeight: 640,
    } as React.CSSProperties}>
      {/* Full-bleed map */}
      <RailwayMap routeCoords={routeCoords} routeColor={routeColor} selectedCode={selectedCode} originCode={originCode} />

      {/* Map overlays (search pill, layers, attribution) */}
      <MapOverlays onSearchClick={() => setTab('search')} hasSheet={hasSheet} />

      {/* Floating left panel — always visible on desktop */}
      <aside style={{
        position: 'absolute',
        zIndex: 10,
        top: 14, left: 14, bottom: 14,
        width: 460,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: 'rgba(244,246,249,.88)',
        backdropFilter: 'blur(26px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(26px) saturate(1.5)',
        borderRadius: 28,
        boxShadow: '0 20px 56px rgba(15,23,34,.20), 0 0 0 1px rgba(255,255,255,.6) inset',
        overflow: 'hidden',
      } as React.CSSProperties}>
        <DesktopNav />
        {tab === 'search' && <SearchPanel />}
        {tab === 'explore' && <ExplorePanel />}
        {tab === 'saved' && <SavedPanel />}
        {tab === 'info' && <InfoPanel />}
      </aside>

      {/* Floating right panel — entity detail sheet */}
      {hasSheet && (
        <aside style={{
          position: 'absolute',
          zIndex: 10,
          top: 14, right: 14, bottom: 14,
          width: 420,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: 'rgba(244,246,249,.88)',
          backdropFilter: 'blur(26px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.5)',
          borderRadius: 28,
          boxShadow: '0 20px 56px rgba(15,23,34,.20), 0 0 0 1px rgba(255,255,255,.6) inset',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {sheetContent}
        </aside>
      )}

      <Toast />
    </div>
  )
}
