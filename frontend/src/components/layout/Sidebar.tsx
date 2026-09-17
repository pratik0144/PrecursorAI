import React from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Globe, ListChecks, Shield,
  Activity, AlertTriangle, BarChart3, Upload, ScrollText,
  Settings, Box, HardHat, ShieldCheck, Database
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { useDatasetStore, DATASETS, DatasetId } from '../../stores/dataset-store'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/command-center', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/globe', icon: Globe, label: 'Geospatial' },
  { to: '/triage', icon: ListChecks, label: 'Triage Queue' },
  { to: '/sif', icon: Shield, label: 'SIF Analysis' },
  { to: '/patterns', icon: Activity, label: 'Patterns' },
  { to: '/assets', icon: Box, label: 'Assets' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/submit', icon: Upload, label: 'Ingest Engine' },
  { to: '/audit', icon: ScrollText, label: 'Audit Log' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId)
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset)
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId)

  const isOfficer = location.pathname !== '/worker'

  const cycleDataset = () => {
    const nextId: DatasetId = activeDatasetId === 'demo' ? 'setA' : activeDatasetId === 'setA' ? 'setB' : 'demo'
    setActiveDataset(nextId)
  }

  return (
    <aside className={cn(
      "h-full border-r border-border bg-surface-1 transition-all duration-300 flex flex-col shadow-sm select-none",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      {/* Brand Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-border h-16 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity overflow-hidden" title="PrecursorAI Home">
          <img 
            src="/logo.png" 
            alt="PrecursorAI Logo" 
            className="w-9 h-9 object-contain shrink-0" 
          />
          {sidebarOpen && (
            <div className="flex flex-col min-w-0">
              <img 
                src="/logo-name.png" 
                alt="PrecursorAI" 
                className="h-5 w-auto object-contain object-left" 
              />
              <span className="text-[9px] text-foreground-dim tracking-wider uppercase font-mono mt-0.5">
                SIF Intelligence
              </span>
            </div>
          )}
        </Link>
        {sidebarOpen && (
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer text-xs"
            title="Collapse Sidebar"
          >
            ◀
          </button>
        )}
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/command-center'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs font-medium font-mono",
              isActive
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "text-foreground-muted hover:bg-surface-2 hover:text-foreground"
            )}
            title={item.label}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls: User Type & Dataset Selector */}
      <div className="p-3 border-t border-border bg-surface-1 space-y-3 shrink-0">
        {sidebarOpen ? (
          <>
            {/* User Type Switcher */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-foreground-muted uppercase tracking-wider px-1">
                <span>User Portal</span>
              </div>
              <div className="p-1 bg-surface-2 rounded-xl border border-border flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate('/command-center')}
                  className={cn(
                    "flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    isOfficer
                      ? "bg-surface-1 text-foreground shadow-xs border border-border"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-3"
                  )}
                  title="Switch to Management Officer Suite"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Officer</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/worker')}
                  className={cn(
                    "flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    !isOfficer
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-3"
                  )}
                  title="Switch to Field Worker Fast Reporting"
                >
                  <HardHat className="w-3.5 h-3.5 text-orange-500" />
                  <span>Worker</span>
                </button>
              </div>
            </div>

            {/* Dataset Option Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-foreground-muted uppercase tracking-wider px-1">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-primary" /> Dataset
                </span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border",
                  activeDatasetId === 'setA' ? "bg-violet-50 text-violet-700 border-violet-200" :
                  activeDatasetId === 'setB' ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-surface-2 text-foreground-dim border-border"
                )}>
                  {activeMeta?.tag}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl border border-border">
                {DATASETS.map((ds) => {
                  const isSelected = activeDatasetId === ds.id;
                  return (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => setActiveDataset(ds.id)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer border",
                        isSelected
                          ? ds.id === 'setA'
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                            : ds.id === 'setB'
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "border-transparent text-foreground-muted hover:text-foreground hover:bg-surface-3"
                      )}
                      title={ds.description}
                    >
                      {ds.id === 'demo' ? 'Demo' : ds.id === 'setA' ? 'Set A' : 'Set B'}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Collapsed Mini Controls */
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => navigate(isOfficer ? '/worker' : '/command-center')}
              className={cn(
                "p-2 rounded-lg border transition-colors cursor-pointer",
                isOfficer ? "bg-surface-2 border-border text-primary" : "bg-orange-600 border-orange-600 text-white"
              )}
              title={isOfficer ? "Switch to Worker Portal" : "Switch to Officer Suite"}
            >
              {isOfficer ? <ShieldCheck className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
            </button>
            <button
              onClick={cycleDataset}
              className={cn(
                "w-8 h-8 rounded-lg border font-mono font-bold text-xs flex items-center justify-center transition-colors cursor-pointer",
                activeDatasetId === 'setA' ? "bg-violet-600 text-white border-violet-600" :
                activeDatasetId === 'setB' ? "bg-amber-600 text-white border-amber-600" :
                "bg-surface-2 text-foreground border-border"
              )}
              title={`Active Dataset: ${activeMeta?.label} (Click to cycle)`}
            >
              {activeDatasetId === 'demo' ? 'D' : activeDatasetId === 'setA' ? 'A' : 'B'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
