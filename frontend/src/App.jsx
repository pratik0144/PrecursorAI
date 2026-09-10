import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import Alerts from './pages/Alerts'
import Cognition from './pages/Cognition'

import { Activity, ShieldAlert, LayoutDashboard, BrainCircuit } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/reports', label: 'Reports', icon: Activity },
  { to: '/alerts', label: 'Alerts', icon: ShieldAlert },
  { to: '/cognition', label: 'Pattern Intelligence', icon: BrainCircuit },
]

function NavBar() {
  return (
    <nav className="bg-[#0B0F19] border-b border-gray-800/60 px-6 py-4 flex items-center gap-8 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          PrecursorAI
        </span>
      </div>
      <div className="flex gap-2 ml-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 font-medium' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/cognition" element={<Cognition />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
