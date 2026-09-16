import { create } from 'zustand'

interface AppState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  selectedLocation: string | null
  setTheme: (theme: 'dark' | 'light') => void
  toggleSidebar: () => void
  setSelectedLocation: (loc: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  selectedLocation: null,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedLocation: (loc) => set({ selectedLocation: loc })
}))
