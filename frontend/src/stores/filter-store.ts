import { create } from 'zustand'
import { EscalationLevel } from '../types'

interface FilterState {
  timeRange: [Date, Date]
  escalationFilter: EscalationLevel[]
  locationFilter: string[]
  assetFilter: string[]
  setFilters: (filters: Partial<FilterState>) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  timeRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  escalationFilter: [],
  locationFilter: [],
  assetFilter: [],
  setFilters: (filters) => set((state) => ({ ...state, ...filters }))
}))
