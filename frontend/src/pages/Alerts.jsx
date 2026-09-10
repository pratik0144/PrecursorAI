/**
 * pages/Alerts.jsx — Live alert feed (polled every 7 seconds).
 * Supports marking individual alerts as read.
 */
import { useCallback } from 'react'
import { usePolling } from '../hooks/usePolling'
import { listAlerts, markAlertRead } from '../services/api'

const SEVERITY_COLORS = {
  CRITICAL: 'border-red-500 bg-red-950',
  HIGH: 'border-orange-500 bg-orange-950',
  MEDIUM: 'border-yellow-500 bg-yellow-950',
  LOW: 'border-gray-500 bg-gray-800',
}

export default function Alerts() {
  const fetchAlerts = useCallback(() => listAlerts(), [])
  const { data: alerts, loading, error } = usePolling(fetchAlerts, 7000)

  const handleMarkRead = async (id) => {
    await markAlertRead(id)
    // Polling will refresh automatically within 7s
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading alerts...</div>
  if (error) return <div className="p-8 text-center text-red-500">Failed to load alerts</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alerts</h1>
      {(!alerts || alerts.length === 0) && (
        <p className="text-gray-400">No alerts at this time.</p>
      )}
      <div className="space-y-3">
        {(alerts || []).map((alert) => (
          <div key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW} ${alert.is_read ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-gray-400">{alert.alert_type}</span>
                <h3 className="font-semibold mt-1">{alert.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
              </div>
              {!alert.is_read && (
                <button onClick={() => handleMarkRead(alert.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 ml-4 whitespace-nowrap">
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
