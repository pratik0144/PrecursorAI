import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReport } from '../services/api'
import { ChevronLeft, ShieldAlert, CheckCircle, HelpCircle, Activity, AlertTriangle, FileText, Zap } from 'lucide-react'

const STATUS_COLORS = {
  ANALYZED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ERROR: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getReport(id)
      .then((r) => setReport(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center p-12">
      <Activity className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )
  if (error) return <div className="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl m-8">{error}</div>
  if (!report) return null

  const a = report.analysis || {}
  const confidencePercent = a.confidence ? Math.round(a.confidence * 100) : 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/reports" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[report.status] || STATUS_COLORS.PENDING}`}>
          Status: {report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Raw Report */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Source Report
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Report Type</p>
                <p className="text-gray-300 font-medium">{report.report_type.replace('_', ' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-gray-300">{report.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Asset ID</p>
                  <p className="text-gray-300">{report.asset_id || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Description</p>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {report.report_text}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className={`w-6 h-6 ${a.sif_potential ? 'text-red-500' : 'text-emerald-500'}`} />
                AI Risk Assessment
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Risk Score</p>
                  <p className={`text-xl font-bold ${a.sif_potential ? 'text-red-400' : 'text-emerald-400'}`}>{a.risk_score || 0}</p>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Confidence</p>
                  <p className={`text-xl font-bold ${confidencePercent >= 90 ? 'text-emerald-400' : confidencePercent >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{confidencePercent}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Hazard Identified</p>
                <p className="text-white font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  {a.hazard || 'None detected'}
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Energy Source</p>
                <p className="text-white font-medium flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  {a.energy_source || 'None significant'}
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Barrier Status</p>
                <p className="text-white font-medium flex items-start gap-2">
                  {a.barrier_status === 'INTACT' ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                  {a.barrier || 'No barrier specified'}
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">IOGP Life-Saving Rule</p>
                <p className="text-blue-400 font-bold tracking-tight">
                  {a.iogp_rule || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">AI Rationale</p>
              <div className="bg-blue-500/5 p-5 rounded-lg border border-blue-500/20 text-gray-300 text-sm leading-relaxed">
                {a.rationale || 'No rationale provided by AI.'}
              </div>
            </div>

            {a.requires_followup && (
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-4 items-start">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-1">Missing Context (Review Required)</h4>
                  <p className="text-yellow-500/80 text-sm">{a.followup_question}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
