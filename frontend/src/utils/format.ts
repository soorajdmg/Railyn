const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const formatRunsOn = (runsOn: boolean[] | null, full = false): string => {
  if (!runsOn) return 'Daily'
  const labels = full ? DAYS_FULL : DAYS
  const active = runsOn.map((v, i) => (v ? labels[i] : null)).filter(Boolean)
  if (active.length === 7) return 'Daily'
  if (active.length === 0) return 'No service'
  return active.join(', ')
}

export const formatTime = (time: string | null): string => {
  if (!time) return '—'
  // time is "HH:MM:SS" or "HH:MM"
  const parts = time.split(':')
  const h = parseInt(parts[0])
  const m = parts[1]
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export const formatDuration = (minutes: number | null): string => {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const formatDistance = (km: number | null): string => {
  if (km === null || km === undefined) return '—'
  return `${km.toLocaleString()} km`
}

export const trainTypeColor = (type: string | null): string => {
  switch (type?.toLowerCase()) {
    case 'rajdhani': return 'bg-purple-600 text-white'
    case 'shatabdi': return 'bg-blue-600 text-white'
    case 'duronto': return 'bg-red-600 text-white'
    case 'superfast': return 'bg-orange-500 text-white'
    case 'express': return 'bg-emerald-600 text-white'
    case 'passenger': return 'bg-gray-500 text-white'
    case 'emu': return 'bg-cyan-600 text-white'
    case 'jan shatabdi': return 'bg-indigo-500 text-white'
    default: return 'bg-slate-600 text-white'
  }
}

export const classColor = (cls: string): string => {
  switch (cls) {
    case '1A': return 'bg-yellow-500 text-black'
    case '2A': return 'bg-blue-500 text-white'
    case '3A': return 'bg-indigo-500 text-white'
    case 'SL': return 'bg-green-600 text-white'
    case 'CC': return 'bg-cyan-500 text-white'
    case '2S': return 'bg-gray-500 text-white'
    case 'FC': return 'bg-red-600 text-white'
    default: return 'bg-slate-500 text-white'
  }
}
