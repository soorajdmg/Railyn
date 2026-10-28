import { Link, useParams } from 'react-router-dom'
import { useDivision } from '../hooks/useZones'

export default function DivisionDetailPage() {
  const { code } = useParams<{ code: string }>()
  const { data: division, isLoading, error } = useDivision(code!)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !division) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-lg">Division not found</p>
        <Link to="/zones" className="mt-2 text-orange-400 hover:underline">← Back to Zones</Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {division.zone && (
          <Link to={`/zones/${division.zone.code}`} className="text-sm text-slate-500 hover:text-slate-300 mb-3 inline-block">
            ← {division.zone.name}
          </Link>
        )}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-xl bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg">
            {division.code}
          </span>
          <h1 className="text-2xl font-bold text-white">{division.name}</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {division.zone && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Zone</div>
              <Link to={`/zones/${division.zone.code}`} className="text-orange-400 hover:underline">
                {division.zone.name} ({division.zone.code})
              </Link>
            </div>
          )}
          {division.hq_city && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">HQ City</div>
              <div className="text-white">{division.hq_city}</div>
            </div>
          )}
          {division.hq_station_code && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">HQ Station</div>
              <Link to={`/stations/${division.hq_station_code}`} className="text-orange-400 hover:underline font-mono">
                {division.hq_station_code}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
