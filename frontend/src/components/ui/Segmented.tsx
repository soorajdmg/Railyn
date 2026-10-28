interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (v: string) => void
  fullWidth?: boolean
}

export function Segmented({ options, value, onChange, fullWidth = false }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: fullWidth ? `repeat(${options.length}, 1fr)` : undefined,
        padding: 4,
        borderRadius: 16,
        background: '#e6eaf0',
        gap: 2,
        width: fullWidth ? '100%' : 'fit-content',
      }}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              height: 42,
              padding: '0 12px',
              border: 0,
              borderRadius: 12,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: active ? '#fff' : 'transparent',
              color: active ? '#0f1722' : '#5b6574',
              boxShadow: active ? '0 1px 4px rgba(15,23,34,.12)' : 'none',
              transition: 'background .15s, color .15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

interface SmallSegmentedProps {
  options: Option[]
  value: string
  onChange: (v: string) => void
}

export function SmallSegmented({ options, value, onChange }: SmallSegmentedProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 3,
        borderRadius: 14,
        background: '#eef1f5',
        gap: 2,
      }}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              height: 32,
              padding: '0 12px',
              border: 0,
              borderRadius: 11,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              background: active ? '#fff' : 'transparent',
              color: active ? '#0f1722' : '#5b6574',
              boxShadow: active ? '0 1px 4px rgba(15,23,34,.12)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
