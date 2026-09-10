import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import Alerts from './pages/Alerts'
import Cognition from './pages/Cognition'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/reports', label: 'Reports' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/cognition', label: 'Pattern Intelligence' },
]

function NavBar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
      <span className="text-white font-bold text-lg tracking-tight">
        ⚡ PrecursorAI
      </span>
      <div className="flex gap-4 ml-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-blue-400 font-semibold' : 'text-gray-400 hover:text-white'}`
            }
          >
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
