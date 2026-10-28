interface KVItem {
  key: string
  value: string
  color?: string
  onClick?: () => void
}

interface Props {
  items: KVItem[]
  onSurface2?: boolean
}

export function KVCard({ items, onSurface2 = false }: Props) {
  return (
    <div
      style={{
        background: onSurface2 ? '#f1f4f8' : '#f1f4f8',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={item.onClick}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            minHeight: 46,
            padding: '0 14px',
            borderBottom: i < items.length - 1 ? '1px solid #e6eaf0' : 'none',
            fontSize: 14,
            cursor: item.onClick ? 'pointer' : 'default',
          }}
        >
          <span style={{ color: '#5b6574' }}>{item.key}</span>
          <span style={{ fontWeight: 600, textAlign: 'right', color: item.color ?? '#0f1722' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
