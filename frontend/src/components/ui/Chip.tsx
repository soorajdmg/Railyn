interface Props {
  label: string
  active: boolean
  onPress: () => void
  onSurface?: boolean
}

export function Chip({ label, active, onPress, onSurface = true }: Props) {
  return (
    <button
      onClick={onPress}
      style={{
        height: 40,
        minWidth: 44,
        padding: '0 14px',
        flexShrink: 0,
        borderRadius: 20,
        border: active ? 'none' : `1px solid ${onSurface ? '#e3e7ee' : '#e6eaf0'}`,
        background: active ? '#2b6ef2' : onSurface ? '#fff' : '#fff',
        color: active ? '#fff' : '#0f1722',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

interface ChipRowProps {
  children: React.ReactNode
}

export function ChipRow({ children }: ChipRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollbarWidth: 'none',
      }}
    >
      {children}
    </div>
  )
}
