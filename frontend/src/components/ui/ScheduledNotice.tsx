import { Info } from 'lucide-react'

export function ScheduledNotice() {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 14,
        borderRadius: 18,
        background: '#e8f0fe',
        color: '#1d4fb8',
        fontSize: 13,
        display: 'flex',
        gap: 10,
        lineHeight: 1.45,
      }}
    >
      <Info size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>Scheduled timings only. This is not live running status or the train's current position.</span>
    </div>
  )
}
