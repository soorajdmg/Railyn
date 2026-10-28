import { ChevronRight } from 'lucide-react'
import type { EntityKind } from '../../data/types'
import { EntityBadge } from './EntityBadge'

interface Props {
  kind: EntityKind
  code: string
  title: string
  sub: string
  onPress: () => void
  onSurface2?: boolean
  dimmed?: boolean
}

export function EntityRow({ kind, code, title, sub, onPress, onSurface2 = false, dimmed = false }: Props) {
  return (
    <div
      onClick={onPress}
      className={onSurface2 ? 'row-hover-2' : 'row-hover'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 62,
        padding: '8px 14px',
        borderBottom: `1px solid ${onSurface2 ? '#e6eaf0' : '#eef1f5'}`,
        cursor: 'pointer',
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      <EntityBadge kind={kind} code={code} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#5b6574', marginTop: 1 }}>{sub}</div>
      </div>
      <ChevronRight size={18} color="#9aa3b2" strokeWidth={2} />
    </div>
  )
}
