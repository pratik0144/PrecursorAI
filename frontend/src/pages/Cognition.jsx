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
import controlRoomHero from '../assets/oil_rig_hero.png'
import '../ops/styles/intelligence.css'

const PRIORITY_STYLE = {
  CRITICAL: { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.28)' },
  HIGH:     { background: 'rgba(249,115,22,0.12)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.28)' },
  MEDIUM:   { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.28)' },
  LOW:      { background: 'rgba(107,114,128,0.12)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.25)' },
}

const TYPE_STYLE = {
  RECURRING:   { background: 'rgba(239,68,68,0.10)', color: '#F87171', border: '1px solid rgba(239,68,68,0.22)' },
  EMERGING:    { background: 'rgba(249,115,22,0.10)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.22)' },
  COMPOUNDING: { background: 'rgba(245,158,11,0.10)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.22)' },
  SYSTEMIC:    { background: 'rgba(139,92,246,0.10)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.22)' },
}

const PATTERN_TYPE_ICON = {
  RECURRING:   Repeat2,
  EMERGING:    TrendingUp,
  COMPOUNDING: GitBranch,
  SYSTEMIC:    Network,
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

  useEffect(() => { fetchPatterns() }, [])

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
      return p.title?.toLowerCase().includes(q)
          || p.hazard?.toLowerCase().includes(q)
          || p.asset_id?.toLowerCase().includes(q)
          || p.location?.toLowerCase().includes(q)
    }
    return true
  })

  const totalCount     = patterns.length
  const recurringCount = patterns.filter(p => p.pattern_type === 'RECURRING').length
  const emergingCount  = patterns.filter(p => p.pattern_type === 'EMERGING').length
  const criticalCount  = patterns.filter(p => p.priority === 'CRITICAL').length

  if (loading) return (
    <div className="loading-screen">
      <BrainCircuit size={28} className="spin" style={{ color: '#A78BFA' }} />
      <span>LOADING PATTERN INTELLIGENCE ENGINE...</span>
    </div>
  )

  return (
    <div className="cognition-page-wrap">
      {/* Hero */}
      <div className="page-hero">
        <img src={controlRoomHero} alt="" className="page-hero-img" />
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <div className="page-hero-label">Tier 2 Analysis</div>
          <div className="page-hero-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="cognition-icon-wrap"><BrainCircuit size={22} /></div>
            Pattern Intelligence
          </div>
          <div className="page-hero-subtitle">
            Recurring Precursors &amp; Multi-Report Safety Pattern Detection
          </div>
        </div>
        <div className="page-hero-action">
          <button
            id="run-pattern-analysis-btn"
            className="btn-primary"
            onClick={handleSweep}
            disabled={sweepRunning}
            style={sweepRunning ? { backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' } : {}}
          >
            <RefreshCw size={14} className={sweepRunning ? 'spin' : ''} />
            {sweepRunning ? 'Running...' : 'Run Pattern Analysis'}
          </button>
        </div>
      </div>

      <div className="cognition-content">
        {/* Sweep result */}
        {sweepResult && (
          <div className={`sweep-banner ${sweepResult.patterns_saved === -1 ? 'error' : sweepResult.patterns_saved === 0 ? 'neutral' : 'success'}`}>
            <Activity size={16} style={{ flexShrink: 0 }} />
            <span>{sweepResult.message}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="cognition-stats-row">
          <div className="cognition-stat-card">
            <div className="cognition-stat-icon purple"><Layers size={17} /></div>
            <div>
              <div className="cognition-stat-label">Active Patterns</div>
              <div className="cognition-stat-value">{totalCount}</div>
            </div>
          </div>
          <div className="cognition-stat-card">
            <div className="cognition-stat-icon red"><Repeat2 size={17} /></div>
            <div>
              <div className="cognition-stat-label">Recurring</div>
              <div className="cognition-stat-value">{recurringCount}</div>
            </div>
          </div>
          <div className="cognition-stat-card">
            <div className="cognition-stat-icon orange"><TrendingUp size={17} /></div>
            <div>
              <div className="cognition-stat-label">Emerging Risks</div>
              <div className="cognition-stat-value">{emergingCount}</div>
            </div>
          </div>
          <div className="cognition-stat-card">
            <div className="cognition-stat-icon red"><ShieldAlert size={17} /></div>
            <div>
              <div className="cognition-stat-label">Critical Priority</div>
              <div className="cognition-stat-value">{criticalCount}</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-type-group">
            <span className="filter-label"><Filter size={12} /> Type:</span>
            {['ALL', 'RECURRING', 'EMERGING', 'COMPOUNDING', 'SYSTEMIC'].map(type => (
              <button
                key={type}
                className={`filter-btn${filterType === type ? ' active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="filter-right">
            <div className="search-wrap">
              <Search size={13} />
              <input
                type="text"
                className="search-input"
                placeholder="Search patterns or assets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Main grid */}
        <div className="cognition-main-grid">
          {/* Pattern list */}
          <div className="pattern-list">
            {filteredPatterns.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={36} style={{ opacity: 0.2 }} />
                <h3>No patterns found</h3>
                <p>
                  {patterns.length === 0
                    ? 'Submit multiple reports on the same asset and run Pattern Analysis.'
                    : 'Try clearing your filters or search query.'}
                </p>
              </div>
            ) : (
              filteredPatterns.map(pattern => {
                const TypeIcon = PATTERN_TYPE_ICON[pattern.pattern_type] || Zap
                const typeStyle = TYPE_STYLE[pattern.pattern_type] || {}
                const prioStyle = PRIORITY_STYLE[pattern.priority] || PRIORITY_STYLE.LOW
                const isSelected = selectedPattern?.id === pattern.id

                return (
                  <div
                    key={pattern.id}
                    className={`pattern-card${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelectPattern(pattern.id)}
                  >
                    <div className="pattern-card-top">
                      <span className="pattern-type-badge" style={typeStyle}>
                        <TypeIcon size={10} />{pattern.pattern_type}
                      </span>
                      <span className="pattern-priority-badge" style={prioStyle}>
                        {pattern.priority}
                      </span>
                    </div>
                    <div className="pattern-title">{pattern.title}</div>
                    <div className="pattern-card-footer">
                      <span className="pattern-asset">{pattern.asset_id || pattern.location || 'GENERAL'}</span>
                      <span className="pattern-report-count"><strong>{pattern.report_count}</strong> reports</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail panel */}
          <div>
            {detailLoading ? (
              <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '22rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#5C6478' }}>
                  <Activity size={20} className="spin" style={{ color: '#A78BFA' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                    LOADING PATTERN DETAILS...
                  </span>
                </div>
              </div>
            ) : selectedPattern ? (
              <div className="pattern-detail-panel">
                <div className="pattern-detail-header">
                  <div className="pattern-detail-badges">
                    <span className="pattern-type-badge" style={{ ...(TYPE_STYLE[selectedPattern.pattern_type] || {}), fontSize: '0.65rem', padding: '0.22rem 0.6rem' }}>
                      {PATTERN_TYPE_ICON[selectedPattern.pattern_type] && (() => {
                        const I = PATTERN_TYPE_ICON[selectedPattern.pattern_type]
                        return <I size={11} />
                      })()}
                      {selectedPattern.pattern_type} PRECURSOR
                    </span>
                    <span className="pattern-priority-badge" style={{ ...(PRIORITY_STYLE[selectedPattern.priority] || PRIORITY_STYLE.LOW), fontSize: '0.65rem', padding: '0.22rem 0.6rem' }}>
                      {selectedPattern.priority} PRIORITY
                    </span>
                  </div>
                  <h2 className="pattern-detail-title">{selectedPattern.title}</h2>

                  <div className="pattern-meta-grid">
                    <div className="pattern-meta-item">
                      <span>Asset / Location</span>
                      <span>{selectedPattern.asset_id || selectedPattern.location || 'N/A'}</span>
                    </div>
                    <div className="pattern-meta-item">
                      <span>Identified Hazard</span>
                      <span style={{ color: '#FB923C' }}>{selectedPattern.hazard || 'Unspecified'}</span>
                    </div>
                    <div className="pattern-meta-item">
                      <span>AI Confidence</span>
                      <span style={{ color: '#F59E0B' }}>
                        {selectedPattern.confidence ? `${Math.round(selectedPattern.confidence * 100)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPattern.description && (
                  <div>
                    <div className="pattern-section-title">
                      <BrainCircuit size={12} style={{ color: '#A78BFA' }} />
                      AI Pattern Synthesis
                    </div>
                    <div className="pattern-synthesis">{selectedPattern.description}</div>
                  </div>
                )}

                {Array.isArray(selectedPattern.evidence) && selectedPattern.evidence.length > 0 && (
                  <div>
                    <div className="pattern-section-title">
                      <AlertTriangle size={12} style={{ color: '#F59E0B' }} />
                      Key Pattern Evidence
                    </div>
                    <div className="evidence-list">
                      {selectedPattern.evidence.map((item, idx) => (
                        <div key={idx} className="evidence-item">
                          <span className="evidence-bullet">▸</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="pattern-section-title" style={{ justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={12} style={{ color: '#60A5FA' }} />
                      Contributing Reports
                    </span>
                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#5C6478', fontSize: '0.68rem' }}>
                      {selectedPattern.contributing_reports?.length || 0} linked
                    </span>
                  </div>

                  <div className="contributing-list">
                    {selectedPattern.contributing_reports?.length > 0 ? (
                      selectedPattern.contributing_reports.map((rl) => (
                        <div key={rl.report_id} className="contributing-item">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className="contributing-id">#{String(rl.report_id).substring(0, 8)}</span>
                              <span className="contributing-type">{rl.report_type || 'INCIDENT'}</span>
                            </div>
                            <div className="contributing-asset">Asset: {rl.asset_id || 'N/A'}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {rl.similarity_score != null && (
                              <span className="similarity-badge">
                                {(rl.similarity_score * 100).toFixed(0)}% match
                              </span>
                            )}
                            <Link
                              to={`/reports/${rl.report_id}`}
                              style={{ color: '#5C6478', padding: '0.25rem', display: 'flex', transition: 'color 0.2s' }}
                              title="View Report"
                            >
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.875rem', textAlign: 'center', fontSize: '0.75rem', color: '#5C6478', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                        NO LINKED REPORTS
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-action-bar">
                  <Link
                    to={`/reports?asset=${encodeURIComponent(selectedPattern.asset_id || selectedPattern.location || '')}`}
                    className="detail-action-link"
                  >
                    <ExternalLink size={13} />
                    View all asset reports in Reports Explorer
                  </Link>
                </div>
              </div>
            ) : (
              <div className="panel" style={{
                minHeight: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.07em',
                color: '#5C6478', textAlign: 'center'
              }}>
                SELECT A PATTERN TO INSPECT DETAILS
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
