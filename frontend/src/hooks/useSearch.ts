import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { search, searchStations, searchTrains } from '../services/search'

export const useSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  })
}

export const useSearchTrains = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  return useQuery({
    queryKey: ['search-trains', debouncedQuery],
    queryFn: () => searchTrains(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })
}

export const useSearchStations = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  return useQuery({
    queryKey: ['search-stations', debouncedQuery],
    queryFn: () => searchStations(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })
}
