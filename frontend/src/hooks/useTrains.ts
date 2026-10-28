import { useQuery } from '@tanstack/react-query'
import { getTrain, getTrainGeoJSON, getTrains, getTrainTimetable } from '../services/trains'

export const useTrains = (params = {}) =>
  useQuery({
    queryKey: ['trains', params],
    queryFn: () => getTrains(params),
  })

export const useTrain = (number: string) =>
  useQuery({
    queryKey: ['train', number],
    queryFn: () => getTrain(number),
    enabled: !!number,
  })

export const useTrainTimetable = (number: string) =>
  useQuery({
    queryKey: ['train-timetable', number],
    queryFn: () => getTrainTimetable(number),
    enabled: !!number,
  })

export const useTrainRoute = (number: string) =>
  useQuery({
    queryKey: ['train-route', number],
    queryFn: () => getTrainGeoJSON(number),
    enabled: !!number,
    staleTime: 30 * 60 * 1000,
  })
