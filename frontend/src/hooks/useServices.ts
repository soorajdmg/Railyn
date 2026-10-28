import { useQuery } from '@tanstack/react-query'
import { getServicesBetween } from '../services/services'

export const useServicesBetween = (from: string, to: string) =>
  useQuery({
    queryKey: ['services', from, to],
    queryFn: () => getServicesBetween(from, to),
    enabled: !!from && !!to,
  })
