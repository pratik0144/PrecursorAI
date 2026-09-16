import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Globe, ListChecks, FileText, Shield,
  Activity, AlertTriangle, BarChart3, Upload, ScrollText,
  Settings, Box
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/globe', icon: Globe, label: 'Geospatial' },
  { to: '/triage', icon: ListChecks, label: 'Triage Queue' },
  { to: '/sif', icon: Shield, label: 'SIF Analysis' },
  { to: '/patterns', icon: Activity, label: 'Patterns' },
  { to: '/assets', icon: Box, label: 'Assets' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/submit', icon: Upload, label: 'Submit Report' },
  { to: '/audit', icon: ScrollText, label: 'Audit Log' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside className={cn(
      "h-full border-r border-border bg-surface-1 transition-all duration-300 flex flex-col shadow-sm",
      sidebarOpen ? "w-60" : "w-16"
    )}>
      <div className="p-4 flex items-center gap-3 border-b border-border h-16 cursor-pointer" onClick={toggleSidebar}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          P
        </div>
        {sidebarOpen && <span className="font-bold text-lg tracking-tight text-foreground">PrecursorAI</span>}
      </div>
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border text-[10px] text-foreground-dim font-mono text-center">
        {sidebarOpen ? "DEMO DATA · v0.1.0" : "DEMO"}
      </div>
    </aside>
  )
}
