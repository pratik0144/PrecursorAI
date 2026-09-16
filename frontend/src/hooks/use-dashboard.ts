import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { DashboardSummary } from '../types'

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary')
      return data
    }
  })
}
