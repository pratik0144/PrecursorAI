import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { useAuthStore } from '../stores/auth-store'

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me')
      return data
    }
  })
}

export const useLogin = () => {
  const login = useAuthStore((s) => s.login)
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      login(data.user, data.access_token)
    }
  })
}
