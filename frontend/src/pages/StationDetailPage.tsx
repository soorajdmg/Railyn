import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStation, useStationTrains } from '../hooks/useStations'
import { trainTypeColor } from '../utils/format'

export default function StationDetailPage() {
  const { code } = useParams<{ code: string }>()
  const { data: station, isLoading, error } = useStation(code!)
  const [trainPage, setTrainPage] = useState(1)
  const { data: trainsData } = useStationTrains(code!, { page: trainPage, limit: 20 })
  const trains = trainsData?.items ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-lg">Station not found</p>
        <Link to="/stations" className="mt-2 text-orange-400 hover:underline">← Back to Stations</Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/stations" className="text-sm text-slate-500 hover:text-slate-300 mb-3 inline-block">
          ← Stations
        </Link>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6 flex-wrap">
          <span className="font-mono text-xl bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg">
            {station.code}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">{station.name}</h1>
            {station.name_aliases?.length > 0 && (
              <div className="text-sm text-slate-500 mt-0.5">Also known as: {station.name_aliases.join(', ')}</div>
            )}
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {station.is_junction && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Junction</span>
              )}
              {station.is_terminus && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Terminus</span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <InfoItem label="State">{station.state || '—'}</InfoItem>
          <InfoItem label="Zone">
            {station.zone ? (
              <Link to={`/zones/${station.zone.code}`} className="text-orange-400 hover:underline">
                {station.zone.name} ({station.zone.code})
              </Link>
            ) : '—'}
          </InfoItem>
          <InfoItem label="Division">
            {station.division ? (
              <Link to={`/divisions/${station.division.code}`} className="text-orange-400 hover:underline">
                {station.division.name}
              </Link>
            ) : '—'}
          </InfoItem>
          {station.elevation_m != null && (
            <InfoItem label="Elevation">{station.elevation_m} m</InfoItem>
          )}
          {station.platform_count != null && (
            <InfoItem label="Platforms">{station.platform_count}</InfoItem>
          )}
          {station.location && (
            <InfoItem label="Coordinates">
              {station.location.coordinates[1].toFixed(4)}, {station.location.coordinates[0].toFixed(4)}
            </InfoItem>
          )}
        </div>

        {/* Railway Lines */}
        {station.lines && station.lines.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Railway Lines</div>
            <div className="flex flex-wrap gap-2">
              {station.lines.map((line) => (
                <span key={line.id} className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-lg">
                  {line.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trains */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-white font-semibold">
              Trains{trainsData?.total != null ? ` (${trainsData.total})` : ''}
            </h2>
          </div>
          {trains.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {trains.map((train) => (
                <Link
                  key={train.id}
                  to={`/trains/${train.train_number}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-mono text-xs text-slate-500 w-14 shrink-0">{train.train_number}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{train.name}</div>
                    <div className="text-xs text-slate-500">
                      {train.source_station_code} → {train.destination_station_code}
                    </div>
                  </div>
                  {train.train_type && (
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${trainTypeColor(train.train_type)}`}>
                      {train.train_type}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-slate-500">No trains found</div>
          )}
          {trainsData && trainsData.total > 20 && (
            <div className="flex justify-center gap-2 p-3 border-t border-slate-800">
              <button
                onClick={() => setTrainPage((p) => Math.max(1, p - 1))}
                disabled={trainPage === 1}
                className="px-3 py-1.5 text-sm bg-slate-800 rounded text-slate-300 disabled:opacity-40"
              >Previous</button>
              <span className="px-3 py-1.5 text-sm text-slate-400">{trainPage}</span>
              <button
                onClick={() => setTrainPage((p) => p + 1)}
                disabled={trainPage * 20 >= (trainsData?.total ?? 0)}
                className="px-3 py-1.5 text-sm bg-slate-800 rounded text-slate-300 disabled:opacity-40"
              >Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-white">{children}</div>
    </div>
  )
}
