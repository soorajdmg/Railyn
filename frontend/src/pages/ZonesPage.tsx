import { Link } from 'react-router-dom'
import { useZones } from '../hooks/useZones'

export default function ZonesPage() {
  const { data: zones, isLoading } = useZones()

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Railway Zones</h1>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(zones ?? []).map((zone) => (
              <Link
                key={zone.id}
                to={`/zones/${zone.code}`}
                className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    {zone.code}
                  </span>
                  <div>
                    <div className="text-white font-medium">{zone.name}</div>
                    {zone.hq_city && <div className="text-xs text-slate-500">HQ: {zone.hq_city}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
