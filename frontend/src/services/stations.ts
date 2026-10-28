import type { PaginatedStations, StationDetail, StationGeoJSON } from '../types/station'
import type { Train } from '../types/train'
import api from './api'

interface StationListParams {
  page?: number
  limit?: number
  zone?: string
  division?: string
  state?: string
  junctions_only?: boolean
  q?: string
}

export const getStations = async (params: StationListParams = {}): Promise<PaginatedStations> => {
  const { data } = await api.get('/api/stations', { params })
  return data
}

export const getStation = async (code: string): Promise<StationDetail> => {
  const { data } = await api.get(`/api/stations/${code}`)
  return data
}

export const getStationTrains = async (
  code: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: Train[]; total: number }> => {
  const { data } = await api.get(`/api/stations/${code}/trains`, { params })
  return data
}

export const getStationsGeoJSON = async (): Promise<StationGeoJSON> => {
  const { data } = await api.get('/api/stations/geojson')
  return data
}
