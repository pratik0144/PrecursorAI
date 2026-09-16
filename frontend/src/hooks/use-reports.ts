import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { Report, ReportDetail, PaginatedResponse } from '../types'

export const useReports = (params: any) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Report>>('/reports', { params })
      return data
    }
  })
}

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportDetail>(`/reports/${id}`)
      return data
    },
    enabled: !!id
  })
}

export const useSubmitReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reportData: Partial<Report>) => {
      const { data } = await apiClient.post<Report>('/reports', reportData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })
}
