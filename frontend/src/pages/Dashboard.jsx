/**
 * pages/Dashboard.jsx — Main dashboard with live-polled metrics and HSE intelligence charts.
 *
 * Polls GET /api/v1/dashboard/summary every 7 seconds.
 * Styled after Petronex oil & gas monitoring dashboard aesthetic.
 */
import { useCallback } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getDashboardSummary } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { Link } from 'react-router-dom'
import { ShieldAlert, FileText, Activity, AlertTriangle, BrainCircuit, ArrowRight } from 'lucide-react'
import '../ops/styles/dashboard.css'

const RISK_COLORS = {
  ROUTINE: '#3b82f6',
  REVIEW:  '#F59E0B',
  HIGH:    '#f97316',
  SIF:     '#ef4444',
}

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#10131A',
        border: '1px solid #222839',
        borderRadius: '6px',
        padding: '0.6rem 0.875rem',
        fontSize: '0.78rem',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <span style={{ color: payload[0].payload.color, fontWeight: 700 }}>
          {payload[0].name}
        </span>
        <span style={{ color: '#C8CDD8', marginLeft: '0.5rem' }}>
          {payload[0].value}
        </span>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const fetchSummary = useCallback(() => getDashboardSummary(), [])
  const { data, loading, error } = usePolling(fetchSummary, 7000)

  if (loading && !data) {
    return (
      <div className="loading-screen">
        <Activity size={28} className="spin" style={{ color: '#F59E0B' }} />
        <span>LOADING INTELLIGENCE DATA...</span>
      </div>
    )
  }

  if (error) {
    return <div className="error-banner">Failed to load dashboard metrics. Check backend connection.</div>
  }

  const riskData = [
    { name: 'Routine',       value: data.risk_breakdown.routine, color: RISK_COLORS.ROUTINE },
    { name: 'Review Needed', value: data.risk_breakdown.review,  color: RISK_COLORS.REVIEW },
    { name: 'High Risk',     value: data.risk_breakdown.high,    color: RISK_COLORS.HIGH },
    { name: 'SIF Potential', value: data.risk_breakdown.sif,     color: RISK_COLORS.SIF },
  ].filter(d => d.value > 0)

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <>
      {/* Status ticker strip */}
      <div className="dash-ticker">
        <span className="dash-ticker-item online">
          <span className="dash-ticker-dot" />
          SYSTEM ONLINE
        </span>
        <span className="dash-ticker-sep">·</span>
        <span className="dash-ticker-item online">
          <span className="dash-ticker-dot" />
          ALL SENSORS ACTIVE
        </span>
        <span className="dash-ticker-sep">·</span>
        <span className="dash-ticker-item">7s REFRESH CYCLE</span>
        <span className="dash-ticker-sep">·</span>
        <span className="dash-ticker-item warn">
          <span className="dash-ticker-dot" />
          HSE MONITORING ACTIVE
        </span>
        <span className="dash-ticker-sep">·</span>
        <span className="dash-ticker-item">AI ANALYSIS ENGINE v2.1</span>
      </div>

      <div className="dashboard-wrap">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div className="dashboard-title">Command Center</div>
            <div className="dashboard-subtitle">Live overview of HSE intelligence and risk distribution.</div>
          </div>
          <div className="dash-timestamp">
            <strong>{timeStr}</strong>
            <br />{dateStr}
          </div>
        </div>

        {/* Metric cards */}
        <div className="metrics-row">
          <div className="metric-card blue">
            <div className="metric-card-top">
              <div className="metric-label">Total Reports</div>
              <div className="metric-icon blue"><FileText size={18} /></div>
            </div>
            <div className="metric-value">{data.total_reports}</div>
            <div className="metric-sub">{data.reports_7d} IN LAST 7 DAYS</div>
          </div>

          <div className="metric-card green">
            <div className="metric-card-top">
              <div className="metric-label">Today's Intake</div>
              <div className="metric-icon green"><Activity size={18} /></div>
            </div>
            <div className="metric-value">{data.reports_today}</div>
            <div className="metric-sub">NEW REPORTS TODAY</div>
          </div>

          <div className="metric-card orange">
            <div className="metric-card-top">
              <div className="metric-label">SIF Potential</div>
              <div className="metric-icon orange"><AlertTriangle size={18} /></div>
            </div>
            <div className="metric-value">{data.sif_potential_count}</div>
            <div className="metric-sub">IDENTIFIED ALL TIME</div>
          </div>

          <div className="metric-card red">
            <div className="metric-card-top">
              <div className="metric-label">Active Alerts</div>
              <div className="metric-icon red"><ShieldAlert size={18} /></div>
            </div>
            <div className="metric-value">{data.unread_alerts}</div>
            <div className="metric-sub">REQUIRE ATTENTION</div>
          </div>
        </div>

        {/* Charts row */}
        <div className="charts-row">
          <div className="panel">
            <h3 className="panel-title">Risk Distribution</h3>
            <div style={{ height: '210px' }}>
              {riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="45%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CUSTOM_TOOLTIP />} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#8892A4' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C6478', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                  NO DATA AVAILABLE
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Top Assets by Reports</h3>
            {data.top_assets_by_reports.map((item, i) => (
              <div key={i} className="list-item">
                <span className="list-label">{item.asset}</span>
                <span className="list-value">{item.count}</span>
              </div>
            ))}
            {data.top_assets_by_reports.length === 0 && (
              <p style={{ color: '#5C6478', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>NO ASSETS RECORDED</p>
            )}
          </div>

          <div className="panel">
            <h3 className="panel-title">Top Hazards Identified</h3>
            {data.top_hazards.map((item, i) => (
              <div key={i} className="list-item">
                <span className="list-label">{item.hazard}</span>
                <span className="list-value">{item.count}</span>
              </div>
            ))}
            {data.top_hazards.length === 0 && (
              <p style={{ color: '#5C6478', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>NO HAZARDS RECORDED</p>
            )}
          </div>
        </div>

        {/* Pattern Intelligence Banner */}
        <div className="intelligence-banner">
          <div className="intelligence-banner-left">
            <div className="intelligence-banner-icon">
              <BrainCircuit size={26} />
            </div>
            <div>
              <h2>Pattern Intelligence &amp; Recurring Precursors</h2>
              <p>Tier 2 cross-report safety pattern detection &amp; multi-report precursor analysis.</p>
            </div>
          </div>
          <Link to="/cognition" className="btn-purple">
            View Pattern Intelligence
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </>
  )
}
