/**
 * pages/Cognition.jsx — Tier 2 Pattern Intelligence & Recurring Precursors view.
 *
 * Features:
 * - Active patterns detected by Tier 2 (Recurring, Emerging, Compounding, Systemic)
 * - Trigger button for manual pattern analysis sweep
 * - Detailed view with evidence, conclusions, and contributing report traceability
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPatterns, getPatternDetail, triggerPatternSweep } from '../services/api'
import {
  BrainCircuit, Repeat2, TrendingUp, GitBranch, Network, Zap,
  RefreshCw, ExternalLink, AlertTriangle,
  Layers, ShieldAlert, Filter, Activity, Search
} from 'lucide-react'

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

const PATTERN_TYPE_BG = {
  RECURRING:    'bg-red-500/10 border-red-500/20 text-red-400',
  EMERGING:     'bg-orange-500/10 border-orange-500/20 text-orange-400',
  COMPOUNDING:  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  SYSTEMIC:     'bg-purple-500/10 border-purple-500/20 text-purple-400',
}

export default function Cognition() {
  const [patterns, setPatterns]               = useState([])
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [detailLoading, setDetailLoading]     = useState(false)
  const [loading, setLoading]                 = useState(true)
  const [sweepRunning, setSweepRunning]       = useState(false)
  const [sweepResult, setSweepResult]         = useState(null)
  const [filterType, setFilterType]           = useState('ALL')
  const [filterPriority, setFilterPriority]   = useState('ALL')
  const [searchQuery, setSearchQuery]         = useState('')

  const fetchPatterns = async () => {
    try {
      const res = await listPatterns({ limit: 100 })
      setPatterns(res.data)
      if (res.data.length > 0 && !selectedPattern) {
        handleSelectPattern(res.data[0].id)
      }
    } catch (e) {
      console.error('Failed to fetch patterns:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatterns()
  }, [])

  const handleSelectPattern = async (id) => {
    setDetailLoading(true)
    try {
      const res = await getPatternDetail(id)
      setSelectedPattern(res.data)
    } catch (e) {
      console.error('Failed to get pattern detail:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSweep = async () => {
    setSweepRunning(true)
    setSweepResult(null)
    try {
      const res = await triggerPatternSweep()
      setSweepResult(res.data)
      await fetchPatterns()
    } catch (e) {
      setSweepResult({ message: 'Sweep failed. Check backend connection.', patterns_saved: -1 })
    } finally {
      setSweepRunning(false)
    }
  }

  const filteredPatterns = patterns.filter(p => {
    if (filterType !== 'ALL' && p.pattern_type !== filterType) return false
    if (filterPriority !== 'ALL' && p.priority !== filterPriority) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const titleMatch = p.title?.toLowerCase().includes(q)
      const hazardMatch = p.hazard?.toLowerCase().includes(q)
      const assetMatch = p.asset_id?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
      return titleMatch || hazardMatch || assetMatch
    }
    return true
  })

  // Summary counts
  const totalCount = patterns.length
  const recurringCount = patterns.filter(p => p.pattern_type === 'RECURRING').length
  const emergingCount = patterns.filter(p => p.pattern_type === 'EMERGING').length
  const criticalCount = patterns.filter(p => p.priority === 'CRITICAL').length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <BrainCircuit className="w-10 h-10 text-purple-500 mb-4 animate-spin" />
          <p className="text-gray-400 font-medium">Loading pattern intelligence engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 border border-purple-500/30 p-2.5 rounded-xl">
              <BrainCircuit className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Pattern Intelligence</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Recurring Precursors & Multi-Report Safety Pattern Detection
              </p>
            </div>
          </div>
        </div>

        <button
          id="run-pattern-analysis-btn"
          onClick={handleSweep}
          disabled={sweepRunning}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            sweepRunning
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${sweepRunning ? 'animate-spin' : ''}`} />
          {sweepRunning ? 'Running Pattern Analysis...' : 'Run Pattern Analysis'}
        </button>
      </div>

      {/* Sweep result toast */}
      {sweepResult && (
        <div className={`mb-6 px-5 py-3.5 rounded-xl text-sm border flex items-center gap-3 shadow-md ${
          sweepResult.patterns_saved === -1
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : sweepResult.patterns_saved === 0
              ? 'bg-gray-800/80 border-gray-700 text-gray-300'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <Activity className="w-5 h-5 shrink-0" />
          <span>{sweepResult.message}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Active Patterns</p>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/15 text-red-400">
            <Repeat2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Recurring Precursors</p>
            <p className="text-2xl font-bold text-white">{recurringCount}</p>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/15 text-orange-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Emerging Risks</p>
            <p className="text-2xl font-bold text-white">{emergingCount}</p>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Critical Priority</p>
            <p className="text-2xl font-bold text-white">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {['ALL', 'RECURRING', 'EMERGING', 'COMPOUNDING', 'SYSTEMIC'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patterns or assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Pattern List (Left) + Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pattern Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredPatterns.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center">
              <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No patterns found</p>
              <p className="text-xs text-gray-500 mt-1">
                {patterns.length === 0
                  ? 'Submit multiple reports on the same asset and run Pattern Analysis.'
                  : 'Try clearing your filters or search query.'}
              </p>
            </div>
          ) : (
            filteredPatterns.map(pattern => {
              const TypeIcon = PATTERN_TYPE_ICON[pattern.pattern_type] || Zap
              const typeBg = PATTERN_TYPE_BG[pattern.pattern_type] || 'bg-gray-800 text-gray-400 border-gray-700'
              const priorityStyle = PRIORITY_STYLES[pattern.priority] || PRIORITY_STYLES.LOW
              const isSelected = selectedPattern?.id === pattern.id

              return (
                <div
                  key={pattern.id}
                  onClick={() => handleSelectPattern(pattern.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#161f32] border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                      : 'bg-[#111827] border-gray-800 hover:border-gray-700 hover:bg-[#131b2c]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${typeBg}`}>
                      <TypeIcon className="w-3 h-3" />
                      {pattern.pattern_type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}>
                      {pattern.priority}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm leading-snug mb-2">
                    {pattern.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2 border-t border-gray-800/80">
                    <span className="font-medium text-gray-300 truncate pr-2">
                      {pattern.asset_id || pattern.location || 'General Asset'}
                    </span>
                    <span className="text-gray-500 shrink-0">
                      <strong className="text-purple-400">{pattern.report_count}</strong> reports
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Column: Detailed Pattern Traceability */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <Activity className="w-6 h-6 text-purple-400 animate-spin mb-3" />
                <p className="text-xs text-gray-400">Loading pattern details & traceability...</p>
              </div>
            </div>
          ) : selectedPattern ? (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-6 sticky top-6">
              {/* Pattern Header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${PATTERN_TYPE_BG[selectedPattern.pattern_type] || 'bg-gray-800 text-gray-300'}`}>
                    {PATTERN_TYPE_ICON[selectedPattern.pattern_type] && (
                      <span className="w-4 h-4">
                        {(() => {
                          const IconComp = PATTERN_TYPE_ICON[selectedPattern.pattern_type]
                          return <IconComp className="w-4 h-4" />
                        })()}
                      </span>
                    )}
                    {selectedPattern.pattern_type} PRECURSOR
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${PRIORITY_STYLES[selectedPattern.priority] || PRIORITY_STYLES.LOW}`}>
                    {selectedPattern.priority} PRIORITY
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mt-3 leading-snug">
                  {selectedPattern.title}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 text-xs">
                  <div>
                    <span className="text-gray-500 block">Asset / Location</span>
                    <span className="font-semibold text-gray-200">{selectedPattern.asset_id || selectedPattern.location || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Identified Hazard</span>
                    <span className="font-semibold text-orange-400 truncate block">{selectedPattern.hazard || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">AI Confidence</span>
                    <span className="font-semibold text-purple-400">
                      {selectedPattern.confidence ? `${Math.round(selectedPattern.confidence * 100)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Conclusion Narrative */}
              {selectedPattern.description && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    AI Pattern Synthesis
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/40 p-4 rounded-xl border border-gray-800/60">
                    {selectedPattern.description}
                  </p>
                </div>
              )}

              {/* Evidence Bullets */}
              {Array.isArray(selectedPattern.evidence) && selectedPattern.evidence.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Key Pattern Evidence
                  </h3>
                  <div className="space-y-2">
                    {selectedPattern.evidence.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
                        <span className="text-purple-400 shrink-0 font-bold">▸</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributing Reports (Traceability) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Contributing Reports (Traceability)
                  </h3>
                  <span className="text-xs text-gray-500">
                    {selectedPattern.contributing_reports?.length || 0} linked reports
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedPattern.contributing_reports && selectedPattern.contributing_reports.length > 0 ? (
                    selectedPattern.contributing_reports.map((reportLink) => (
                      <div
                        key={reportLink.report_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-900/70 border border-gray-800 hover:border-gray-700 text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-400 font-medium">
                              #{String(reportLink.report_id).substring(0, 8)}
                            </span>
                            <span className="text-gray-400 uppercase text-[10px] bg-gray-800 px-1.5 py-0.5 rounded font-semibold">
                              {reportLink.report_type || 'INCIDENT'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] truncate mt-0.5">
                            Asset: {reportLink.asset_id || 'N/A'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {reportLink.similarity_score !== undefined && reportLink.similarity_score !== null && (
                            <span className="text-[11px] text-purple-300 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                              {(reportLink.similarity_score * 100).toFixed(0)}% match
                            </span>
                          )}
                          <Link
                            to={`/reports/${reportLink.report_id}`}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                            title="View Report Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-800 text-center text-xs text-gray-500">
                      No individual report links recorded for this pattern.
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <Link
                  to={`/reports?asset=${encodeURIComponent(selectedPattern.asset_id || selectedPattern.location || '')}`}
                  className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View all asset reports in Reports Explorer
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              Select a pattern on the left to inspect detailed AI synthesis and report traceability.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
