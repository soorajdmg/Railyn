import { useState } from 'react'
import { useServicesBetween } from '../hooks/useServices'
import { useSearchStations } from '../hooks/useSearch'
import type { ServiceResult } from '../types/search'
import { classColor, formatDistance, formatDuration, formatTime, trainTypeColor } from '../utils/format'

export default function ServicesPage() {
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [fromCode, setFromCode] = useState('')
  const [toCode, setToCode] = useState('')
  const [fromFocus, setFromFocus] = useState(false)
  const [toFocus, setToFocus] = useState(false)

  const { data: fromResults } = useSearchStations(fromInput)
  const { data: toResults } = useSearchStations(toInput)
  const { data: services, isLoading } = useServicesBetween(fromCode, toCode)

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Services Between Stations</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From */}
            <div className="relative">
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">From</label>
              <input
                type="text"
                value={fromInput}
                onChange={(e) => { setFromInput(e.target.value); setFromCode('') }}
                onFocus={() => setFromFocus(true)}
                onBlur={() => setTimeout(() => setFromFocus(false), 150)}
                placeholder="Station name or code..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
              {fromFocus && fromResults?.results && fromResults.results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  {fromResults.results.map((r) => (
                    <button
                      key={r.id}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700"
                      onMouseDown={() => { setFromInput(r.name); setFromCode(r.code) }}
                    >
                      <span className="font-mono text-xs text-blue-400">{r.code}</span>
                      <span className="text-sm text-white">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {fromCode && (
                <div className="mt-1 text-xs text-emerald-400">
                  Selected: <span className="font-mono">{fromCode}</span>
                </div>
              )}
            </div>

            {/* To */}
            <div className="relative">
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">To</label>
              <input
                type="text"
                value={toInput}
                onChange={(e) => { setToInput(e.target.value); setToCode('') }}
                onFocus={() => setToFocus(true)}
                onBlur={() => setTimeout(() => setToFocus(false), 150)}
                placeholder="Station name or code..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
              {toFocus && toResults?.results && toResults.results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  {toResults.results.map((r) => (
                    <button
                      key={r.id}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700"
                      onMouseDown={() => { setToInput(r.name); setToCode(r.code) }}
                    >
                      <span className="font-mono text-xs text-blue-400">{r.code}</span>
                      <span className="text-sm text-white">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {toCode && (
                <div className="mt-1 text-xs text-emerald-400">
                  Selected: <span className="font-mono">{toCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {services && services.length === 0 && (
          <div className="text-center py-8 text-slate-500">No services found between these stations</div>
        )}

        {services && services.length > 0 && (
          <>
            <div className="text-sm text-slate-500 mb-3">{services.length} services found</div>
            <div className="grid gap-3">
              {services.map((s, i) => <ServiceCard key={i} service={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ServiceCard({ service }: { service: ServiceResult }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="shrink-0">
          <div className="text-xs font-mono text-slate-500">{service.train_number}</div>
          {service.train_type && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block ${trainTypeColor(service.train_type)}`}>
              {service.train_type}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">{service.train_name}</div>
          <div className="flex gap-4 mt-2 text-sm">
            <div>
              <div className="text-xs text-slate-500">Dep</div>
              <div className="text-slate-300 font-mono">{formatTime(service.from_departure)}</div>
            </div>
            <div className="text-slate-600 self-end pb-1">→</div>
            <div>
              <div className="text-xs text-slate-500">Arr</div>
              <div className="text-slate-300 font-mono">{formatTime(service.to_arrival)}</div>
            </div>
            {service.duration_minutes && (
              <div>
                <div className="text-xs text-slate-500">Duration</div>
                <div className="text-slate-300">{formatDuration(service.duration_minutes)}</div>
              </div>
            )}
            {service.distance_km && (
              <div>
                <div className="text-xs text-slate-500">Distance</div>
                <div className="text-slate-300">{formatDistance(service.distance_km)}</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {service.classes?.map((cls) => (
            <span key={cls} className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${classColor(cls)}`}>
              {cls}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
