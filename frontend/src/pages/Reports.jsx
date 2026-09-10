/**
 * pages/Reports.jsx — Report list and submission form.
 * POST /api/v1/reports to submit, GET /api/v1/reports to list.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listReports, submitReport } from '../services/api'

const REPORT_TYPES = ['UNSAFE_ACT', 'UNSAFE_CONDITION', 'NEAR_MISS']

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Safety Reports</h1>

      {/* Submit Form — TODO: replace with a proper component */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-2xl">
        <select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}
          className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white">
          {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <textarea value={form.report_text} onChange={(e) => setForm({ ...form, report_text: e.target.value })}
          placeholder="Describe the safety event..." rows={4}
          className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white" required />
        <div className="flex gap-2">
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location (e.g. Unit 4)" className="flex-1 p-2 rounded border border-gray-600 bg-gray-800 text-white" />
          <input value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
            placeholder="Asset ID (e.g. TANK-17)" className="flex-1 p-2 rounded border border-gray-600 bg-gray-800 text-white" />
        </div>
        <button type="submit" disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Analyzing...' : 'Submit Report'}
        </button>
      </form>

      {/* Report List */}
      {loading ? <p className="text-gray-400">Loading reports...</p> : (
        <div className="space-y-2">
          {reports.map((r) => (
            <Link key={r.id || r.report_id} to={`/reports/${r.id || r.report_id}`}
              className="block p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition">
              <div className="flex justify-between">
                <span className="font-medium">{r.report_type}</span>
                <span className="text-sm text-gray-400">{r.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{r.asset_id} · {r.location}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
