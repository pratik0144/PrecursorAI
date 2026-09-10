/**
 * pages/Alerts.jsx — Live alert feed (polled every 7 seconds).
 * Supports marking individual alerts as read.
 */
import { useCallback, useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { listAlerts, markAlertRead } from '../services/api'
import { ShieldAlert, AlertTriangle, Info, Check, Activity, Clock } from 'lucide-react'

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/10 border-red-500/20 text-red-500',
  HIGH: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
  MEDIUM: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
  LOW: 'bg-gray-800/50 border-gray-700 text-gray-400',
}

const SEVERITY_ICONS = {
  CRITICAL: <ShieldAlert className="w-5 h-5 text-red-500" />,
  HIGH: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  MEDIUM: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  LOW: <Info className="w-5 h-5 text-gray-400" />
}

export default function Alerts() {
  const fetchAlerts = useCallback(() => listAlerts(), [])
  const { data: alerts, loading, error } = usePolling(fetchAlerts, 7000)
  const [markingId, setMarkingId] = useState(null)

  const handleMarkRead = async (id) => {
    setMarkingId(id)
    try {
      await markAlertRead(id)
      // Optimistic update could happen here, or just let polling handle it
    } finally {
      // Small delay so the spinner is visible
      setTimeout(() => setMarkingId(null), 500)
    }
  }

  if (loading && !alerts) return (
    <div className="flex justify-center p-12">
      <Activity className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )
  
  if (error) return <div className="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl m-8">Failed to load alerts</div>

  const unreadCount = (alerts || []).filter(a => !a.is_read).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Active Alerts 
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-1">High-priority SIF events requiring immediate attention.</p>
        </div>
      </div>

      {(!alerts || alerts.length === 0) && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-300">All Clear</h3>
          <p className="text-gray-500 mt-1">No active alerts at this time.</p>
        </div>
      )}

      <div className="space-y-4">
        {(alerts || []).map((alert) => (
          <div key={alert.id}
            className={`p-5 rounded-xl border transition-all duration-300 ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW} ${alert.is_read ? 'opacity-40 grayscale' : 'shadow-sm'}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 shrink-0 bg-[#0B0F19] p-2 rounded-lg border border-gray-800/50">
                  {SEVERITY_ICONS[alert.severity] || SEVERITY_ICONS.LOW}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 text-white/80">
                      {alert.alert_type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{alert.title}</h3>
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap max-w-3xl">
                    {alert.message}
                  </p>
                </div>
              </div>
              
              {!alert.is_read ? (
                <button 
                  onClick={() => handleMarkRead(alert.id)}
                  disabled={markingId === alert.id}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {markingId === alert.id ? <Activity className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Dismiss
                </button>
              ) : (
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
