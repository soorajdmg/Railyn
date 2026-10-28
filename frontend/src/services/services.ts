import type { ServiceResult } from '../types/search'
import api from './api'

export const getServicesBetween = async (
  from: string,
  to: string
): Promise<ServiceResult[]> => {
  const { data } = await api.get('/api/services', { params: { from, to } })
  return data
}
