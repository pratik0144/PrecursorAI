import { create } from 'zustand'
import { UserRole } from '../types'

interface User {
  id: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: '1', name: 'Demo User', role: UserRole.ANALYST }, // Mocked initial
  token: 'mock-token',
  isAuthenticated: true,
  login: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
