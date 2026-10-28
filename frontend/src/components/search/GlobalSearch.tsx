import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'
import type { SearchResult } from '../../types/search'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data, isLoading } = useSearch(query)
  const results = data?.results ?? []

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    if (result.type === 'train') {
      navigate(`/trains/${result.code}`)
    } else {
      navigate(`/stations/${result.code}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[focusedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const trains = results.filter((r) => r.type === 'train')
  const stations = results.filter((r) => r.type === 'station')

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setFocusedIndex(-1) }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search trains, stations..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
          )}

          {trains.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                Trains
              </div>
              {trains.map((result) => {
                const idx = results.indexOf(result)
                return (
                  <button
                    key={`train-${result.id}`}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                      idx === focusedIndex ? 'bg-slate-700' : ''
                    }`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    <span className="text-xs font-mono bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                      {result.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">{result.name}</div>
                      {result.subtext && (
                        <div className="text-xs text-slate-500 truncate">{result.subtext}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}

          {stations.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                Stations
              </div>
              {stations.map((result) => {
                const idx = results.indexOf(result)
                return (
                  <button
                    key={`station-${result.id}`}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                      idx === focusedIndex ? 'bg-slate-700' : ''
                    }`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {result.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">{result.name}</div>
                      {result.subtext && (
                        <div className="text-xs text-slate-500 truncate">{result.subtext}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
