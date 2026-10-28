import { useAppState } from '../../store/appState'

export function Toast() {
  const toast = useAppState(s => s.toast)
  if (!toast) return null

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 50,
        top: 118,
        left: 16,
        right: 16,
        padding: '14px 16px',
        borderRadius: 18,
        background: '#0c111a',
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 12px 32px rgba(12,17,26,.3)',
        pointerEvents: 'none',
      }}
    >
      {toast}
    </div>
  )
}
