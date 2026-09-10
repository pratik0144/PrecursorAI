/**
 * pages/ReportDetails.jsx — Full report detail including Tier 1 analysis.
 * Shows: SIF potential, risk score, IOGP rule, RAG evidence, rationale.
 * Also shows human-review status if confidence was below threshold.
 */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getReport } from '../services/api'

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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading report...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!report) return null

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Report Details</h1>
      <p className="text-sm text-gray-400 mb-6">ID: {report.id}</p>

      {/* TODO: replace raw JSON with structured analysis cards */}
      <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto">
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  )
}
