/**
 * pages/Cognition.jsx — Tier 2 Pattern Intelligence view.
 *
 * Shows:
 * - Active patterns detected by Tier 2
 * - Trigger button for manual cognition sweep
 * - Sweep status
 * - Pattern detail with contributing reports (traceability)
 */
import { useState, useEffect } from 'react'
import { listPatterns, getPatternDetail, triggerCognitionSweep, getCognitionStatus } from '../services/api'

export default function Cognition() {
  const [patterns, setPatterns] = useState([])
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [sweepStatus, setSweepStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sweeping, setSweeping] = useState(false)

  useEffect(() => {
    Promise.all([listPatterns(), getCognitionStatus()])
      .then(([pRes, sRes]) => {
        setPatterns(pRes.data)
        setSweepStatus(sRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSelectPattern = async (id) => {
    const res = await getPatternDetail(id)
    setSelectedPattern(res.data)
  }

  const handleSweep = async () => {
    setSweeping(true)
    try {
      await triggerCognitionSweep()
    } finally {
      setSweeping(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading pattern intelligence...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pattern Intelligence (Tier 2)</h1>
        <button onClick={handleSweep} disabled={sweeping}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
          {sweeping ? 'Running Sweep...' : 'Trigger Cognition Sweep'}
        </button>
      </div>

      {sweepStatus && (
        <div className="mb-4 text-sm text-gray-400">
          Last sweep: {sweepStatus.last_sweep || 'Never'} · Status: {sweepStatus.status}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern List */}
        <div className="space-y-3">
          {patterns.length === 0 && <p className="text-gray-400">No patterns detected yet.</p>}
          {patterns.map((p) => (
            <button key={p.id} onClick={() => handleSelectPattern(p.id)}
              className={`w-full text-left p-4 rounded-lg border transition ${selectedPattern?.id === p.id ? 'border-purple-500 bg-purple-950' : 'border-gray-700 hover:border-purple-400'}`}>
              <div className="flex justify-between">
                <span className="font-semibold">{p.title}</span>
                <span className={`text-xs font-mono ${p.priority === 'CRITICAL' ? 'text-red-400' : p.priority === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {p.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{p.pattern_type} · {p.report_count} reports</p>
            </button>
          ))}
        </div>

        {/* Pattern Detail + Contributing Reports */}
        {selectedPattern && (
          <div className="p-4 rounded-lg border border-purple-700 bg-purple-950/30">
            <h2 className="font-bold text-lg mb-2">{selectedPattern.title}</h2>
            <p className="text-sm text-gray-300 mb-4">{selectedPattern.description}</p>
            <h3 className="font-semibold text-sm mb-2 text-purple-300">Contributing Reports (Traceability)</h3>
            <div className="space-y-2">
              {(selectedPattern.contributing_reports || []).map((r) => (
                <div key={r.report_id} className="p-2 rounded bg-gray-800 text-xs">
                  <span className="text-gray-400">{r.report_type}</span> · {r.asset_id} ·{' '}
                  <span className="text-purple-300">similarity: {r.similarity_score?.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
