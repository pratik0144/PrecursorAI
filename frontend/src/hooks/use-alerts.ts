import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { Alert, PaginatedResponse } from '../types'

export const useAlerts = (params?: any) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Alert>>('/alerts', { params })
      return data
    }
  })
}

export const useUpdateAlert = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Alert> }) => {
      const { data } = await apiClient.patch<Alert>(`/alerts/${id}`, updates)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }
  })
}
