import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export const useIOGPRules = () => {
  return useQuery({
    queryKey: ['reference', 'iogp'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reference/iogp')
      return data
    }
  })
}

export const useEnergySources = () => {
  return useQuery({
    queryKey: ['reference', 'energy'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reference/energy')
      return data
    }
  })
}

export const useBarriers = () => {
  return useQuery({
    queryKey: ['reference', 'barriers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reference/barriers')
      return data
    }
  })
}
