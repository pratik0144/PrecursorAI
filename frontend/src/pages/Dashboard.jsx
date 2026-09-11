/**
 * pages/Dashboard.jsx — Main dashboard with live-polled metrics and HSE intelligence charts.
 *
 * Polls GET /api/v1/dashboard/summary every 7 seconds.
 */
import { useCallback } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getDashboardSummary } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { Link } from 'react-router-dom'
import { ShieldAlert, FileText, Activity, AlertTriangle, BrainCircuit, ArrowRight } from 'lucide-react'

const RISK_COLORS = {
  ROUTINE: '#3b82f6',
  REVIEW:  '#eab308',
  HIGH:    '#f97316',
  SIF:     '#ef4444',
}

function MetricCard({ title, value, icon: Icon, colorClass, subtitle }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:border-gray-700 transition-colors">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const fetchSummary = useCallback(() => getDashboardSummary(), [])
  const { data, loading, error } = usePolling(fetchSummary, 7000)

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-8 h-8 text-blue-500 mb-4 animate-spin" />
          <p className="text-gray-400">Loading intelligence data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 m-6">
        Failed to load dashboard metrics. Check backend connection.
      </div>
    )
  }

  const riskData = [
    { name: 'Routine',       value: data.risk_breakdown.routine, color: RISK_COLORS.ROUTINE },
    { name: 'Review Needed', value: data.risk_breakdown.review,  color: RISK_COLORS.REVIEW },
    { name: 'High Risk',     value: data.risk_breakdown.high,    color: RISK_COLORS.HIGH },
    { name: 'SIF Potential',  value: data.risk_breakdown.sif,     color: RISK_COLORS.SIF },
  ].filter(d => d.value > 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
        <p className="text-gray-400 mt-1">Live overview of HSE intelligence and risk distribution.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Reports"
          value={data.total_reports}
          icon={FileText}
          colorClass="bg-blue-500/20 text-blue-400"
          subtitle={`${data.reports_7d} in the last 7 days`}
        />
        <MetricCard
          title="Today's Intake"
          value={data.reports_today}
          icon={Activity}
          colorClass="bg-emerald-500/20 text-emerald-400"
        />
        <MetricCard
          title="SIF Potential"
          value={data.sif_potential_count}
          icon={AlertTriangle}
          colorClass="bg-orange-500/20 text-orange-400"
          subtitle="Identified across all time"
        />
        <MetricCard
          title="Active Alerts"
          value={data.unread_alerts}
          icon={ShieldAlert}
          colorClass="bg-red-500/20 text-red-400"
          subtitle="Require immediate attention"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Risk Distribution</h2>
          <div className="flex-1 min-h-[300px]">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Assets by Reports</h2>
            <div className="space-y-4">
              {data.top_assets_by_reports.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <span className="text-gray-300 font-medium">{item.asset}</span>
                  <span className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md text-sm font-bold">
                    {item.count}
                  </span>
                </div>
              ))}
              {data.top_assets_by_reports.length === 0 && (
                <p className="text-gray-500 text-sm">No assets recorded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Hazards Identified</h2>
            <div className="space-y-4">
              {data.top_hazards.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <span className="text-gray-300 font-medium truncate pr-4">{item.hazard}</span>
                  <span className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md text-sm font-bold shrink-0">
                    {item.count}
                  </span>
                </div>
              ))}
              {data.top_hazards.length === 0 && (
                <p className="text-gray-500 text-sm">No hazards recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Intelligence & Recurring Precursors Banner */}
      <div className="bg-[#111827] border border-purple-500/20 rounded-xl p-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-purple-950/20 via-gray-900 to-gray-900">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600/20 border border-purple-500/30 p-3 rounded-xl">
            <BrainCircuit className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Pattern Intelligence & Recurring Precursors
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Tier 2 cross-report safety pattern detection & multi-report precursor analysis.
            </p>
          </div>
        </div>
        <Link
          to="/cognition"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/25 shrink-0"
        >
          View Pattern Intelligence
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

