import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import Alerts from './pages/Alerts'
import Cognition from './pages/Cognition'

import { Shield, LayoutDashboard, Activity, AlertOctagon, BrainCircuit } from 'lucide-react'
import './ops/styles/base.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-logo">
            <span className="topbar-logo-icon"><Shield size={20} /></span>
            <span className="topbar-logo-text">PRECURSOR<em>AI</em></span>
          </div>

          <nav className="topbar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Activity size={16} /> Reports
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <AlertOctagon size={16} /> Alerts
            </NavLink>
            <NavLink to="/cognition" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <BrainCircuit size={16} /> Pattern Intelligence
            </NavLink>
          </nav>

          <div className="topbar-live">
            <span className="live-dot" />
            LIVE
          </div>
        </header>

        <main className="main-content">
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
