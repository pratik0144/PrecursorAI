import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export const useGeoAggregate = (level: string) => {
  return useQuery({
    queryKey: ['geo-aggregate', level],
    queryFn: async () => {
      const { data } = await apiClient.get('/geo/aggregate', { params: { level } })
      return data
    }
  })
}

export const useGeoAssets = () => {
  return useQuery({
    queryKey: ['geo-assets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/geo/assets')
      return data
    }
  })
}
