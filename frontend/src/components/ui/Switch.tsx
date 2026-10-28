interface Props {
  on: boolean
  onToggle: () => void
  amber?: boolean
}

export function Switch({ on, onToggle, amber = false }: Props) {
  const trackBg = on ? (amber ? '#e59a1a' : '#2b6ef2') : '#d5dbe4'
  const knobLeft = on ? 21 : 3

  return (
    <div
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        background: trackBg,
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'background .2s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: knobLeft,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(15,23,34,.25)',
          transition: 'left .2s',
        }}
      />
    </div>
  )
}
