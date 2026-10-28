import { useQuery } from '@tanstack/react-query'
import { getDivision, getDivisions, getZone, getZones } from '../services/zones'

export const useZones = () =>
  useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })

export const useZone = (code: string) =>
  useQuery({
    queryKey: ['zone', code],
    queryFn: () => getZone(code),
    enabled: !!code,
  })

export const useDivisions = () =>
  useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions,
    staleTime: 24 * 60 * 60 * 1000,
  })

export const useDivision = (code: string) =>
  useQuery({
    queryKey: ['division', code],
    queryFn: () => getDivision(code),
    enabled: !!code,
  })
