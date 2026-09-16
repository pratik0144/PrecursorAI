import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { Pattern, PaginatedResponse } from '../types'

export const usePatterns = (params?: any) => {
  return useQuery({
    queryKey: ['patterns', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Pattern>>('/patterns', { params })
      return data
    }
  })
}

export const usePattern = (id: string) => {
  return useQuery({
    queryKey: ['patterns', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Pattern>(`/patterns/${id}`)
      return data
    },
    enabled: !!id
  })
}

export const useSweep = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/patterns/sweep')
      return data
    }
  })
}
