import type { PaginatedTrains, TrainDetail, TrainGeoJSON, TrainTimetable } from '../types/train'
import api from './api'

interface TrainListParams {
  page?: number
  limit?: number
  train_type?: string
  zone?: string
  q?: string
}

export const getTrains = async (params: TrainListParams = {}): Promise<PaginatedTrains> => {
  const { data } = await api.get('/api/trains', { params })
  return data
}

export const getTrain = async (number: string): Promise<TrainDetail> => {
  const { data } = await api.get(`/api/trains/${number}`)
  return data
}

export const getTrainTimetable = async (number: string): Promise<TrainTimetable> => {
  const { data } = await api.get(`/api/trains/${number}/timetable`)
  return data
}

export const getTrainGeoJSON = async (number: string): Promise<TrainGeoJSON> => {
  const { data } = await api.get(`/api/trains/${number}/geojson`)
  return data
}
