import { Bookmark, BookmarkCheck, ChevronLeft, Share2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntityKind } from '../../data/types'
import type { SnapPos } from '../../store/appState'
import { useAppState } from '../../store/appState'
import { useIsMobile } from '../../hooks/useIsMobile'

// ─── Shared constants ────────────────────────────────────────────────────────

const KIND_COLOR: Record<string, string> = {
  train: '#2b6ef2', station: '#0fa390', line: '#7a5af5',
  zone: '#e59a1a', division: '#e59a1a',
}
const KIND_BG: Record<string, string> = {
  train: '#e8f0fe', station: '#dff5f0', line: '#efeafe',
  zone: '#fdf1dc', division: '#fdf1dc',
}

const SNAPS: SnapPos[] = [628, 400, 54]
const H = 844

function nearest(top: number): SnapPos {
  return SNAPS.reduce((prev, curr) =>
    Math.abs(curr - top) < Math.abs(prev - top) ? curr : prev
  )
}

// ─── Shared circle button ─────────────────────────────────────────────────────

function CircleBtn({ children, onClick, 'aria-label': label, size = 38 }: {
  children: React.ReactNode
  onClick?: () => void
  'aria-label'?: string
  size?: number
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: size, height: size,
        borderRadius: size / 2,
        border: 0,
        background: 'rgba(15,23,34,.07)',
        color: '#3b4657',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,23,34,.12)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,23,34,.07)' }}
    >
      {children}
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode
  kind: EntityKind
  kicker?: string
  title: string
  code?: string
  sub?: string
  canFav?: boolean
  isFav?: boolean
  onFav?: () => void
}

// ─── Desktop panel ────────────────────────────────────────────────────────────
// Fills the floating right aside in AppLayout — no own shadow/background

function DesktopPanel({ children, kind, kicker, title, code, sub, canFav, isFav, onFav }: Props) {
  const { popSheet, closeSheet, sheetStack, showToast } = useAppState()
  const canBack = sheetStack.length > 1
  const color = KIND_COLOR[kind] ?? '#2b6ef2'
  const codeBg = KIND_BG[kind] ?? '#e8f0fe'

  const handleShare = async () => {
    const text = `${title}${code ? ` (${code})` : ''} — Railyn`
    try {
      if (navigator.share) await navigator.share({ title: 'Railyn', text })
      else { await navigator.clipboard.writeText(text); showToast('Copied to clipboard') }
    } catch { /* dismissed */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', flexShrink: 0, borderBottom: '1px solid rgba(15,23,34,.07)' }}>
        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          {canBack && (
            <CircleBtn aria-label="Back" onClick={popSheet} size={34}>
              <ChevronLeft size={16} strokeWidth={2.5} />
            </CircleBtn>
          )}
          <div style={{ flex: 1 }} />
          {canFav && (
            <CircleBtn aria-label={isFav ? 'Remove from saved' : 'Save'} onClick={onFav} size={34}>
              {isFav
                ? <BookmarkCheck size={15} strokeWidth={2} color={color} />
                : <Bookmark size={15} strokeWidth={2} />}
            </CircleBtn>
          )}
          <CircleBtn aria-label="Share" onClick={handleShare} size={34}><Share2 size={14} strokeWidth={2} /></CircleBtn>
          <CircleBtn aria-label="Close" onClick={closeSheet} size={34}><X size={16} strokeWidth={2.5} /></CircleBtn>
        </div>

        {/* Kicker + code badge */}
        {(kicker || code) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            {kicker && (
              <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {kicker}
              </span>
            )}
            {code && (
              <span style={{ height: 20, padding: '0 7px', borderRadius: 6, background: codeBg, color, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', letterSpacing: '0.03em' }}>
                {code}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: '#0f1722' }}>
          {title}
        </div>
        {sub && <div style={{ fontSize: 12, color: '#5b6574', marginTop: 3 }}>{sub}</div>}
      </div>

      {/* Scrollable body */}
      <div className="sheet-body" style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 28px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Mobile bottom sheet (drag/snap) ─────────────────────────────────────────

function MobileSheet({ children, kind, kicker, title, code, sub, canFav, isFav, onFav }: Props) {
  const { snap, setSnap, popSheet, closeSheet, sheetStack, showToast } = useAppState()
  const [dragTop, setDragTop] = useState<number | null>(null)
  const dragStartY = useRef(0)
  const dragStartTop = useRef<number>(snap)
  const isDragging = useRef(false)
  const moved = useRef(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const canBack = sheetStack.length > 1
  const currentTop = dragTop !== null ? dragTop : snap

  const color = KIND_COLOR[kind] ?? '#2b6ef2'
  const codeBg = KIND_BG[kind] ?? '#e8f0fe'

  const cycleSnap = useCallback(() => {
    if (snap === 628) setSnap(400)
    else if (snap === 400) setSnap(54)
    else setSnap(400)
  }, [snap, setSnap])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    isDragging.current = true
    moved.current = false
    dragStartY.current = e.clientY
    dragStartTop.current = snap
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [snap])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const delta = e.clientY - dragStartY.current
    if (Math.abs(delta) >= 4) moved.current = true
    const newTop = Math.max(54, Math.min(H - 60, dragStartTop.current + delta))
    setDragTop(newTop)
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    if (!moved.current) cycleSnap()
    else if (dragTop !== null) setSnap(nearest(dragTop))
    setDragTop(null)
  }, [cycleSnap, dragTop, setSnap])

  const handleShare = useCallback(async () => {
    const text = `${title}${code ? ` (${code})` : ''} — Railyn`
    try {
      if (navigator.share) await navigator.share({ title: 'Railyn', text })
      else { await navigator.clipboard.writeText(text); showToast('Copied to clipboard') }
    } catch { /* dismissed */ }
  }, [title, code, showToast])

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      e.preventDefault()
      if (sheetStack.length > 1) popSheet()
      else closeSheet()
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [sheetStack.length, popSheet, closeSheet])

  const isTransitioning = dragTop === null
  const transition = isTransitioning ? 'top .32s cubic-bezier(.2,.8,.2,1)' : 'none'

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 20,
        left: 0, right: 0,
        top: currentTop, bottom: 0,
        background: 'rgba(255,255,255,.9)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderRadius: '30px 30px 0 0',
        boxShadow: '0 -8px 32px rgba(15,23,34,.14)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition,
      }}
    >
      {/* Draggable header */}
      <div
        className="grab"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none', padding: '8px 18px 12px', flexShrink: 0 }}
      >
        {/* Grabber pill */}
        <div style={{ width: 40, height: 5, borderRadius: 3, background: '#cfd5de', margin: '0 auto 10px' }} />

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {canBack && (
            <CircleBtn aria-label="Back" onClick={popSheet}>
              <ChevronLeft size={18} strokeWidth={2} />
            </CircleBtn>
          )}
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color }}>{kicker}</span>
          {canFav && (
            <CircleBtn aria-label="Save" onClick={onFav}>
              <Bookmark size={18} strokeWidth={2} fill={isFav ? color : 'none'} color={isFav ? color : '#0f1722'} />
            </CircleBtn>
          )}
          <CircleBtn aria-label="Share" onClick={handleShare}><Share2 size={18} strokeWidth={2} /></CircleBtn>
          <CircleBtn aria-label="Close" onClick={closeSheet}><X size={18} strokeWidth={2} /></CircleBtn>
        </div>

        {/* Title */}
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginTop: 6 } as React.CSSProperties}>
          {title}
        </div>

        {/* Code pill + sub */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, minWidth: 0 }}>
          {code && (
            <span style={{ height: 24, padding: '0 9px', borderRadius: 8, background: codeBg, color, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {code}
            </span>
          )}
          {sub && (
            <span style={{ fontSize: 13, color: '#5b6574', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sub}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={bodyRef} className="sheet-body" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 116px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Exported component ───────────────────────────────────────────────────────

export function BottomSheet(props: Props) {
  const isMobile = useIsMobile()
  return isMobile ? <MobileSheet {...props} /> : <DesktopPanel {...props} />
}
