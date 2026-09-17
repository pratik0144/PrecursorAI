import React from 'react'
import { Menu, Search, Bell, User, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { useDatasetStore, DATASETS } from '../../stores/dataset-store'
import { useIncidentStore } from '../../stores/incident-store'
import { cn } from '@/lib/utils'

export default function CommandBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId)
  const incidents = useIncidentStore((s) => s.incidents)

  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId)
  const openCount = incidents.filter(i => i.status === 'OPEN').length

  return (
    <header className="h-16 border-b border-border bg-surface-1 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4">
      {/* Left: Sidebar Toggle & Context Path */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-surface-2 rounded-lg text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-foreground-dim">
          <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain shrink-0" />
          <span className="font-bold text-foreground">PrecursorAI</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-semibold">HSSE Command Suite</span>
        </div>
      </div>
      
      {/* Right: Search, Dataset Status, Alerts, Avatar */}
      <div className="flex items-center gap-3">
        {/* Discrete Active Dataset Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border rounded-lg text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-foreground-dim text-[11px]">DATA:</span>
          <span className="font-bold text-foreground">{activeMeta?.tag}</span>
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-dim" />
          <input 
            type="text" 
            placeholder="Search assets, precursors, rules..." 
            className="h-8.5 w-56 lg:w-72 rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-xs outline-none focus:border-primary text-foreground font-sans transition-colors placeholder:text-foreground-dim"
          />
        </div>

        {/* Notifications */}
        <button 
          className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-2 rounded-lg relative transition-colors cursor-pointer" 
          title="Active Alerts"
        >
          <Bell className="h-4.5 w-4.5" />
          {openCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-surface-3 border border-border flex items-center justify-center text-foreground font-mono font-bold text-xs select-none cursor-pointer hover:border-primary/50 transition-colors"
          title="HSSE Officer"
        >
          <User className="h-4 w-4 text-foreground-muted" />
        </div>
      </div>
    </header>
  )
}
