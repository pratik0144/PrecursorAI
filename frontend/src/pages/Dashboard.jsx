/**
 * pages/Dashboard.jsx — Main dashboard with live-polled metrics and Tier 2 pattern panel.
 *
 * Polls GET /api/v1/dashboard/summary every 7 seconds.
 * Patterns loaded on mount and after each sweep.
 * "Run Pattern Analysis" button triggers POST /api/v1/patterns/sweep.
 */
import { useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePolling } from '../hooks/usePolling'
import { getDashboardSummary, listPatterns, triggerPatternSweep } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import {
  ShieldAlert, FileText, Activity, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  Zap, TrendingUp, Repeat2, GitBranch, Network,
} from 'lucide-react'

const RISK_COLORS = {
  ROUTINE: '#3b82f6',
  REVIEW:  '#eab308',
  HIGH:    '#f97316',
  SIF:     '#ef4444',
}

const PRIORITY_STYLES = {
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  HIGH:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MEDIUM:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW:      'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

const PATTERN_TYPE_ICON = {
  RECURRING:    Repeat2,
  EMERGING:     TrendingUp,
  COMPOUNDING:  GitBranch,
  SYSTEMIC:     Network,
}

const PATTERN_TYPE_COLOR = {
  RECURRING:    'text-red-400',
  EMERGING:     'text-orange-400',
  COMPOUNDING:  'text-yellow-400',
  SYSTEMIC:     'text-purple-400',
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function PatternCard({ pattern }) {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = PATTERN_TYPE_ICON[pattern.pattern_type] || Zap
  const typeColor = PATTERN_TYPE_COLOR[pattern.pattern_type] || 'text-gray-400'
  const priorityStyle = PRIORITY_STYLES[pattern.priority] || PRIORITY_STYLES.LOW
  const evidence = Array.isArray(pattern.evidence) ? pattern.evidence : []

  return (
    <div className="bg-[#0d1420] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all">
      {/* Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TypeIcon className={`w-5 h-5 shrink-0 ${typeColor}`} />
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${typeColor}`}>
                {pattern.pattern_type}
              </p>
              <h3 className="text-white font-semibold text-sm leading-snug truncate">
                {pattern.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priorityStyle}`}>
              {pattern.priority}
            </span>
            {expanded
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </div>
        </div>

        {/* Key stats row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-400">{pattern.report_count}</span> reports
          </span>
          {pattern.hazard && (
            <span className="truncate">
              <AlertTriangle className="w-3 h-3 inline mr-1 text-orange-400" />
              {pattern.hazard}
            </span>
          )}
          {pattern.confidence && (
            <span className="ml-auto shrink-0">
              {Math.round(pattern.confidence * 100)}% confidence
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-800 px-5 pb-5 pt-4 space-y-4">
          {/* Conclusion */}
          {pattern.description && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5">
                AI Conclusion
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {pattern.description}
              </p>
            </div>
          )}

          {/* Evidence bullets */}
          {evidence.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5">
                Evidence
              </p>
              <ul className="space-y-1.5">
                {evidence.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-blue-400 shrink-0 mt-0.5">▸</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View in Reports */}
          <div className="pt-1">
            <Link
              to={`/reports?asset=${encodeURIComponent(pattern.asset_id || pattern.location || '')}`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View contributing reports
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const fetchSummary = useCallback(() => getDashboardSummary(), [])
  const { data, loading, error } = usePolling(fetchSummary, 7000)

  // Pattern state
  const [patterns, setPatterns]       = useState([])
  const [patternsLoading, setPLoading] = useState(true)
  const [sweepRunning, setSweepRunning] = useState(false)
  const [sweepResult, setSweepResult]   = useState(null)  // last sweep summary

  // Load patterns on mount
  useEffect(() => {
    listPatterns({ status: 'ACTIVE', limit: 20 })
      .then(res => setPatterns(res.data))
      .catch(() => {})
      .finally(() => setPLoading(false))
  }, [])

  // Trigger sweep
  const handleSweep = async () => {
    setSweepRunning(true)
    setSweepResult(null)
    try {
      const res = await triggerPatternSweep()
      setSweepResult(res.data)
      // Reload patterns after sweep
      const pRes = await listPatterns({ status: 'ACTIVE', limit: 20 })
      setPatterns(pRes.data)
    } catch (e) {
      setSweepResult({ message: 'Sweep failed. Check backend logs.', patterns_saved: -1 })
    } finally {
      setSweepRunning(false)
    }
  }

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
    { name: 'Routine',      value: data.risk_breakdown.routine, color: RISK_COLORS.ROUTINE },
    { name: 'Review Needed', value: data.risk_breakdown.review, color: RISK_COLORS.REVIEW },
    { name: 'High Risk',    value: data.risk_breakdown.high,    color: RISK_COLORS.HIGH },
    { name: 'SIF Potential', value: data.risk_breakdown.sif,   color: RISK_COLORS.SIF },
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

      {/* ── Tier 2: Recurring Precursors ─────────────────────────────────────── */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        {/* Panel header + sweep button */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Recurring Precursors
              {patterns.length > 0 && (
                <span className="ml-2 text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  {patterns.length} active
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tier 2 cross-report pattern analysis — patterns no single report reveals alone.
            </p>
          </div>

          <button
            id="run-pattern-analysis-btn"
            onClick={handleSweep}
            disabled={sweepRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              sweepRunning
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${sweepRunning ? 'animate-spin' : ''}`} />
            {sweepRunning ? 'Analysing...' : 'Run Pattern Analysis'}
          </button>
        </div>

        {/* Sweep result toast */}
        {sweepResult && (
          <div className={`mb-4 mt-3 px-4 py-3 rounded-lg text-sm border flex items-center gap-2 ${
            sweepResult.patterns_saved === -1
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : sweepResult.patterns_saved === 0
                ? 'bg-gray-800/60 border-gray-700 text-gray-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <Activity className="w-4 h-4 shrink-0" />
            {sweepResult.message}
          </div>
        )}

        {/* Patterns grid */}
        {patternsLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Activity className="w-5 h-5 animate-spin mr-2" />
            Loading patterns...
          </div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
            <TrendingUp className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recurring patterns detected yet.</p>
            <p className="text-gray-600 text-sm mt-1">
              Submit multiple reports on the same asset or location, then run the analysis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {patterns.map(p => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
