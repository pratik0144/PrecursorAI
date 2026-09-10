import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listReports, submitReport } from '../services/api'
import { Activity, Plus, Search, ChevronRight, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const REPORT_TYPES = ['UNSAFE_ACT', 'UNSAFE_CONDITION', 'NEAR_MISS']

const STATUS_COLORS = {
  ANALYZED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ERROR: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const TYPE_ICONS = {
  UNSAFE_ACT: <Activity className="w-4 h-4" />,
  UNSAFE_CONDITION: <Info className="w-4 h-4" />,
  NEAR_MISS: <AlertTriangle className="w-4 h-4 text-orange-400" />
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    report_type: 'NEAR_MISS',
    report_text: '',
    location: '',
    asset_id: '',
  })

  useEffect(() => {
    listReports().then((r) => setReports(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await submitReport(form)
      setReports((prev) => [res.data, ...prev])
      setForm({ report_type: 'NEAR_MISS', report_text: '', location: '', asset_id: '' })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reports Log</h1>
          <p className="text-gray-400 mt-1">Review AI-analyzed safety reports.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-[#111827] border border-gray-800 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Submit Safety Report</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Report Type</label>
                <select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Unit 4" 
                  className="w-full p-2.5 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Asset ID (Optional)</label>
                <input value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                  placeholder="e.g. TANK-17" 
                  className="w-full p-2.5 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
              <textarea value={form.report_text} onChange={(e) => setForm({ ...form, report_text: e.target.value })}
                placeholder="Describe the sequence of events, hazards observed, and actions taken..." rows={4}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" required />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2">
                {submitting ? (
                  <><Activity className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : 'Submit to AI'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset / Location</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Submitted</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">AI Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {reports.map((r) => (
                  <tr key={r.id || r.report_id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                        {TYPE_ICONS[r.report_type] || <Info className="w-4 h-4" />}
                        {r.report_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-medium text-sm">{r.asset_id || 'Unknown Asset'}</span>
                        <span className="text-gray-500 text-xs">{r.location || 'Unknown Location'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[r.status] || STATUS_COLORS.PENDING}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/reports/${r.id || r.report_id}`} className="inline-flex items-center text-gray-500 group-hover:text-blue-400 transition-colors">
                        <span className="sr-only">View</span>
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
