import { Link, useParams } from 'react-router-dom'
import { useZone } from '../hooks/useZones'

export default function ZoneDetailPage() {
  const { code } = useParams<{ code: string }>()
  const { data: zone, isLoading, error } = useZone(code!)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !zone) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-lg">Zone not found</p>
        <Link to="/zones" className="mt-2 text-orange-400 hover:underline">← Back to Zones</Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/zones" className="text-sm text-slate-500 hover:text-slate-300 mb-3 inline-block">
          ← Zones
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-xl bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg">
            {zone.code}
          </span>
          <h1 className="text-2xl font-bold text-white">{zone.name}</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {zone.hq_city && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">HQ City</div>
              <div className="text-white">{zone.hq_city}</div>
            </div>
          )}
          {zone.hq_station_code && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">HQ Station</div>
              <Link to={`/stations/${zone.hq_station_code}`} className="text-orange-400 hover:underline font-mono">
                {zone.hq_station_code}
              </Link>
            </div>
          )}
          {zone.website && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Website</div>
              <a href={zone.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">
                Official Website ↗
              </a>
            </div>
          )}
        </div>

        {zone.divisions && zone.divisions.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h2 className="text-white font-semibold">Divisions ({zone.divisions.length})</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {zone.divisions.map((div) => (
                <Link
                  key={div.id}
                  to={`/divisions/${div.code}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-mono text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {div.code}
                  </span>
                  <div>
                    <div className="text-white">{div.name}</div>
                    {div.hq_city && <div className="text-xs text-slate-500">HQ: {div.hq_city}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
