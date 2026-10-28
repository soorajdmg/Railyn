import type { ReactNode } from 'react'

interface Props {
  label: string
  onClick: () => void
  children: ReactNode
  size?: number
  bg?: string
  color?: string
}

export function CircleIconButton({ label, onClick, children, size = 38, bg = '#eef1f5', color = '#0f1722' }: Props) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: 0,
        background: bg,
        color,
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#e2e7ee')}
      onMouseLeave={e => (e.currentTarget.style.background = bg)}
    >
      {children}
    </button>
  )
}
