import type { DivisionDetail, Zone, ZoneDetail } from '../types/zone'
import api from './api'

export const getZones = async (): Promise<Zone[]> => {
  const { data } = await api.get('/api/zones')
  return data
}

export const getZone = async (code: string): Promise<ZoneDetail> => {
  const { data } = await api.get(`/api/zones/${code}`)
  return data
}

export const getDivisions = async (): Promise<DivisionDetail[]> => {
  const { data } = await api.get('/api/divisions')
  return data
}

export const getDivision = async (code: string): Promise<DivisionDetail> => {
  const { data } = await api.get(`/api/divisions/${code}`)
  return data
}
