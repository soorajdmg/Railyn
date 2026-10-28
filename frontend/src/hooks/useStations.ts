import { useQuery } from '@tanstack/react-query'
import { getStation, getStations, getStationsGeoJSON, getStationTrains } from '../services/stations'

export const useStations = (params = {}) =>
  useQuery({
    queryKey: ['stations', params],
    queryFn: () => getStations(params),
  })

export const useStation = (code: string) =>
  useQuery({
    queryKey: ['station', code],
    queryFn: () => getStation(code),
    enabled: !!code,
  })

export const useStationTrains = (code: string, params = {}) =>
  useQuery({
    queryKey: ['station-trains', code, params],
    queryFn: () => getStationTrains(code, params),
    enabled: !!code,
  })

export const useStationsGeoJSON = () =>
  useQuery({
    queryKey: ['stations-geojson'],
    queryFn: getStationsGeoJSON,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
