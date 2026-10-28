interface Props {
  title: string
  count?: string | number
  action?: React.ReactNode
}

export function SectionHeader({ title, count, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        margin: '24px 4px 10px',
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</span>
      {count !== undefined && (
        <span style={{ fontSize: 13, color: '#5b6574' }}>{count}</span>
      )}
      {action}
    </div>
  )
}
