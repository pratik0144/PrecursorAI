import { NavLink } from 'react-router-dom'
import { Activity, AlertTriangle, FileText, Search, LayoutDashboard } from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { cn } from '../../lib/utils'

export default function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
    { to: '/patterns', icon: Activity, label: 'Patterns' },
  ]

  return (
    <aside className={cn(
      "h-full border-r border-border bg-card transition-all duration-300 flex flex-col",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 flex items-center justify-center border-b border-border h-16">
        {sidebarOpen ? <span className="font-bold text-xl tracking-tight text-accent">PrecursorAI</span> : <span className="font-bold text-accent">P.AI</span>}
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
