import type { SearchResponse } from '../types/search'
import api from './api'

export const search = async (q: string): Promise<SearchResponse> => {
  const { data } = await api.get('/api/search', { params: { q } })
  return data
}

export const searchTrains = async (q: string): Promise<SearchResponse> => {
  const { data } = await api.get('/api/search/trains', { params: { q } })
  return data
}

export const searchStations = async (q: string): Promise<SearchResponse> => {
  const { data } = await api.get('/api/search/stations', { params: { q } })
  return data
}
