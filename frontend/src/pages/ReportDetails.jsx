import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReport } from '../services/api'
import { ChevronLeft, ShieldAlert, CheckCircle, HelpCircle, Activity, AlertTriangle, FileText, Zap } from 'lucide-react'
import '../ops/styles/intelligence.css'

const STATUS_CLASS = {
  RESOLVED: 'badge-resolved',
  ANALYZED: 'badge-analyzed',
  REVIEW:   'badge-review',
  PENDING:  'badge-error',
  ERROR:    'badge-error',
}

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    getReport(id)
      .then((r) => setReport(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="loading-screen">
      <Activity size={24} className="spin" style={{ color: '#F59E0B' }} />
      <span>LOADING REPORT...</span>
    </div>
  )
  if (error) return <div className="error-banner">{error}</div>
  if (!report) return null

  const a = report.analysis || {}
  const confidencePercent = a.confidence ? Math.round(a.confidence * 100) : 0

  return (
    <div className="detail-page-wrap">
      <div className="detail-top-bar">
        <Link to="/reports" className="back-link">
          <ChevronLeft size={15} /> Back to Reports
        </Link>
        <span className={`badge ${STATUS_CLASS[report.status] || 'badge-error'}`}>
          Status: {report.status}
        </span>
      </div>

      <div className="detail-grid">
        {/* Left — Source Report */}
        <div className="panel">
          <h2 className="detail-section-title">
            <FileText size={16} style={{ color: '#8892A4' }} />
            Source Report
          </h2>

          <div className="detail-field">
            <div className="detail-field-label">Report Type</div>
            <div className="detail-field-value">{report.report_type.replace(/_/g, ' ')}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="detail-field">
              <div className="detail-field-label">Location</div>
              <div className="detail-field-value">{report.location || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Asset ID</div>
              <div className="detail-field-value" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60A5FA' }}>
                {report.asset_id || 'N/A'}
              </div>
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Description</div>
            <div className="detail-text-block">{report.report_text}</div>
          </div>
        </div>

        {/* Right — AI Analysis */}
        <div className="panel">
          <div className="risk-header">
            <h2 className="detail-section-title" style={{ margin: 0 }}>
              <ShieldAlert size={17} style={{ color: a.sif_potential ? '#EF4444' : '#10B981' }} />
              AI Risk Assessment
            </h2>
            <div className="risk-scores">
              <div className="risk-score-item">
                <div className="risk-score-label">Risk Score</div>
                <div className="risk-score-value" style={{ color: a.sif_potential ? '#F87171' : '#34D399' }}>
                  {a.risk_score || 0}
                </div>
              </div>
              <div className="risk-score-divider" />
              <div className="risk-score-item">
                <div className="risk-score-label">Confidence</div>
                <div className="risk-score-value" style={{
                  color: confidencePercent >= 90 ? '#34D399'
                       : confidencePercent >= 70 ? '#F59E0B'
                       : '#F87171'
                }}>
                  {confidencePercent}%
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-grid">
            <div className="analysis-cell">
              <div className="detail-field-label">Hazard Identified</div>
              <div className="detail-field-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.4rem' }}>
                <AlertTriangle size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                {a.hazard || 'None detected'}
              </div>
            </div>
            <div className="analysis-cell">
              <div className="detail-field-label">Energy Source</div>
              <div className="detail-field-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.4rem' }}>
                <Zap size={14} style={{ color: '#60A5FA', flexShrink: 0, marginTop: '2px' }} />
                {a.energy_source || 'None significant'}
              </div>
            </div>
            <div className="analysis-cell">
              <div className="detail-field-label">Barrier Status</div>
              <div className="detail-field-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.4rem' }}>
                {a.barrier_status === 'INTACT'
                  ? <CheckCircle size={14} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                  : <ShieldAlert size={14} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />}
                {a.barrier || 'No barrier specified'}
              </div>
            </div>
            <div className="analysis-cell">
              <div className="detail-field-label">IOGP Life-Saving Rule</div>
              <div className="detail-field-value" style={{ color: '#60A5FA', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.4rem' }}>
                {a.iogp_rule || 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <div className="detail-field-label" style={{ marginBottom: '0.6rem' }}>AI Rationale</div>
            <div className="rationale-block">{a.rationale || 'No rationale provided by AI.'}</div>
          </div>

          {a.requires_followup && (
            <div className="followup-block">
              <HelpCircle size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4>Missing Context (Review Required)</h4>
                <p>{a.followup_question}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
