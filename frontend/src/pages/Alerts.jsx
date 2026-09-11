/**
 * pages/Alerts.jsx — Live alert feed (polled every 7 seconds).
 * Supports marking individual alerts as read.
 */
import { useCallback, useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { listAlerts, markAlertRead } from '../services/api'
import { ShieldAlert, AlertTriangle, Info, Check, Activity, Clock } from 'lucide-react'
import heroImage from '../assets/image1.png'
import '../ops/styles/intelligence.css'

const SEVERITY_CARD_CLASS = {
  CRITICAL: '',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
}

const SEVERITY_ICON_CLASS = {
  CRITICAL: '',
  HIGH:     'orange',
  MEDIUM:   'yellow',
  LOW:      'gray',
}

function SeverityIcon({ severity }) {
  const map = {
    CRITICAL: <ShieldAlert size={17} />,
    HIGH:     <AlertTriangle size={17} />,
    MEDIUM:   <AlertTriangle size={17} />,
    LOW:      <Info size={17} />,
  }
  return map[severity] || map.LOW
}

export default function Alerts() {
  const fetchAlerts = useCallback(() => listAlerts(), [])
  const { data: alerts, loading, error } = usePolling(fetchAlerts, 7000)
  const [markingId, setMarkingId] = useState(null)

  const handleMarkRead = async (id) => {
    setMarkingId(id)
    try { await markAlertRead(id) }
    finally { setTimeout(() => setMarkingId(null), 500) }
  }

  if (loading && !alerts) return (
    <div className="loading-screen">
      <Activity size={24} className="spin" style={{ color: '#F59E0B' }} />
      <span>LOADING ALERTS...</span>
    </div>
  )

  if (error) return <div className="error-banner">Failed to load alerts</div>

  const unreadCount = (alerts || []).filter(a => !a.is_read).length

  return (
    <div className="alerts-page-wrap">
      {/* Hero */}
      <div className="page-hero">
        <img src={heroImage} alt="" className="page-hero-img" />
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <div className="page-hero-label red">SIF Detection System</div>
          <div className="page-hero-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Active Alerts
            {unreadCount > 0 && <span className="badge-alert">{unreadCount}</span>}
          </div>
          <div className="page-hero-subtitle">High-priority SIF events requiring immediate attention.</div>
        </div>
      </div>

      <div className="alerts-content">
        {(!alerts || alerts.length === 0) && (
          <div className="empty-state">
            <ShieldAlert size={44} style={{ opacity: 0.2 }} />
            <h3>All Clear</h3>
            <p>No active alerts at this time.</p>
          </div>
        )}

        <div className="alerts-list">
          {(alerts || []).map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${SEVERITY_CARD_CLASS[alert.severity] || ''} ${alert.is_read ? 'read' : ''}`}
            >
              <div className={`alert-icon ${SEVERITY_ICON_CLASS[alert.severity] || ''}`}>
                <SeverityIcon severity={alert.severity} />
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <div className="alert-title-wrap">
                    <div className="alert-type-row">
                      <span className="alert-type-badge">{alert.alert_type}</span>
                      <span className="alert-time">
                        <Clock size={11} />
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="alert-title">{alert.title}</h3>
                  </div>

                  {!alert.is_read ? (
                    <button
                      className="btn-outline"
                      onClick={() => handleMarkRead(alert.id)}
                      disabled={markingId === alert.id}
                    >
                      {markingId === alert.id
                        ? <Activity size={13} className="spin" />
                        : <Check size={13} />}
                      Dismiss
                    </button>
                  ) : (
                    <span className="alert-dismissed">
                      <Check size={11} /> Resolved
                    </span>
                  )}
                </div>

                <p className="alert-message">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
