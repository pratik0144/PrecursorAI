/**
 * pages/Dashboard.jsx — Main dashboard with live-polled metrics.
 * Polls GET /api/v1/dashboard/summary every 7 seconds.
 */
import { useCallback } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getDashboardSummary } from '../services/api'

export default function Dashboard() {
  const fetchSummary = useCallback(() => getDashboardSummary(), [])
  const { data, loading, error } = usePolling(fetchSummary, 7000)

  if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Safety Intelligence Dashboard</h1>
      {/* TODO: render summary cards, risk breakdown, top assets/hazards */}
      <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
