import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrains } from '../hooks/useTrains'
import type { Train } from '../types/train'
import { classColor, formatDistance, formatDuration, trainTypeColor } from '../utils/format'

const TRAIN_TYPES = ['Express', 'Superfast', 'Passenger', 'Rajdhani', 'Shatabdi', 'Jan Shatabdi', 'Duronto', 'EMU']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TrainsPage() {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useTrains({ q: query, train_type: selectedType, page, limit: 20 })
  const trains = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Trains</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search by name or number..."
            className="flex-1 min-w-48 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1) }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Types</option>
            {TRAIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4">{total} trains found</div>
            <div className="grid gap-3">
              {trains.map((train) => <TrainCard key={train.id} train={train} />)}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-slate-400">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                  className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TrainCard({ train }: { train: Train }) {
  const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <Link
      to={`/trains/${train.train_number}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="text-xs font-mono text-slate-500">{train.train_number}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">{train.name}</h3>
            {train.train_type && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${trainTypeColor(train.train_type)}`}>
                {train.train_type}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            <span className="font-mono">{train.source_station_code}</span>
            <span className="mx-2 text-slate-600">→</span>
            <span className="font-mono">{train.destination_station_code}</span>
            {train.distance_km && <span className="ml-3 text-slate-500">{formatDistance(train.distance_km)}</span>}
            {train.duration_minutes && <span className="ml-2 text-slate-500">{formatDuration(train.duration_minutes)}</span>}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {/* Days grid */}
            {train.runs_on && (
              <div className="flex gap-0.5">
                {train.runs_on.map((active, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 flex items-center justify-center text-[10px] rounded font-medium ${
                      active ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-600'
                    }`}
                    title={DAYS[i]}
                  >
                    {DAYS_SHORT[i]}
                  </span>
                ))}
              </div>
            )}
            {/* Classes */}
            <div className="flex gap-1">
              {train.classes?.slice(0, 4).map((cls) => (
                <span key={cls} className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${classColor(cls)}`}>
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
