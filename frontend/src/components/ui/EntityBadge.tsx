import type { EntityKind } from '../../data/types'

interface Props {
  kind: EntityKind
  code: string
  size?: 'sm' | 'md'
}

const COLORS: Record<EntityKind, { bg: string; text: string }> = {
  train: { bg: '#e8f0fe', text: '#1d4fb8' },
  station: { bg: '#dff5f0', text: '#0b7f70' },
  line: { bg: '#efeafe', text: '#5b3fd1' },
  zone: { bg: '#fdf1dc', text: '#a2620a' },
  division: { bg: '#fdf1dc', text: '#a2620a' },
}

export function EntityBadge({ kind, code, size = 'md' }: Props) {
  const c = COLORS[kind]
  return (
    <div
      style={{
        minWidth: size === 'md' ? 46 : 38,
        height: size === 'md' ? 36 : 28,
        padding: '0 8px',
        borderRadius: 11,
        background: c.bg,
        color: c.text,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: size === 'md' ? 12 : 11,
        letterSpacing: '.01em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {code}
    </div>
  )
}
