import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStations } from '../hooks/useStations'
import type { Station } from '../types/station'

export default function StationsPage() {
  const [query, setQuery] = useState('')
  const [selectedState] = useState('')
  const [junctionsOnly, setJunctionsOnly] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useStations({
    q: query,
    state: selectedState,
    junctions_only: junctionsOnly,
    page,
    limit: 50,
  })
  const stations = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Stations</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search by name or code..."
            className="flex-1 min-w-48 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={junctionsOnly}
              onChange={(e) => { setJunctionsOnly(e.target.checked); setPage(1) }}
              className="accent-orange-500"
            />
            Junctions only
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4">{total} stations found</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stations.map((s) => <StationCard key={s.id} station={s} />)}
            </div>

            {total > 50 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >Previous</button>
                <span className="px-3 py-1.5 text-sm text-slate-400">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 50 >= total}
                  className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StationCard({ station }: { station: Station }) {
  return (
    <Link
      to={`/stations/${station.code}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500/40 transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="font-mono text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded shrink-0">
          {station.code}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{station.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{station.state}</div>
          <div className="flex gap-1 mt-1.5">
            {station.is_junction && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Junction</span>
            )}
            {station.is_terminus && (
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Terminus</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
