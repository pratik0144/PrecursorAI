import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import Alerts from './pages/Alerts'
import Cognition from './pages/Cognition'

import { Shield, LayoutDashboard, Activity, AlertOctagon, BrainCircuit, LogOut, User, ShieldCheck, ArrowLeft } from 'lucide-react'
import './ops/styles/base.css'

export default function App() {
  const [role, setRole] = useState(null)

  if (!role) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--amber-bright)', filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' }}>
            <Shield size={48} />
          </div>
          <h1 style={{ color: 'var(--text-data)', fontFamily: 'var(--font-head)', fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>PRECURSOR<em style={{ fontStyle: 'normal', color: 'var(--amber-bright)' }}>AI</em></h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>SELECT AUTHORIZATION LEVEL</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => setRole('USER')} style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}>
            <User size={18} /> Field User
          </button>
          <button className="btn-primary" onClick={() => setRole('ADMIN')} style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} /> Admin Console
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <button 
            onClick={() => window.history.back()}
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(180,130,40,0.25)',
              borderRadius: '8px',
              padding: '0.4rem',
              marginRight: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(180,120,30,0.05)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'none'; }}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="topbar-logo">
            <span className="topbar-logo-icon"><Shield size={20} /></span>
            <span className="topbar-logo-text">PRECURSOR<em>AI</em></span>
          </div>

          <nav className="topbar-nav">
            {role === 'ADMIN' && (
              <>
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
              </>
            )}
            {role === 'USER' && (
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Activity size={16} /> File Report
              </NavLink>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
            <div className="topbar-live">
              <span className="live-dot" />
              LIVE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(180,130,40,0.2)', paddingLeft: '1.5rem' }}>
              <span style={{ color: 'var(--text-label)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{role}</span>
              <button className="btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setRole(null)}>
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            {role === 'ADMIN' ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reports" element={<Reports role="ADMIN" />} />
                <Route path="/reports/:id" element={<ReportDetails />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/cognition" element={<Cognition />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Reports role="USER" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
