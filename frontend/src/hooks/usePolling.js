/**
 * hooks/usePolling.js — Generic polling hook for dashboard/alert live updates.
 * Uses REST polling (no WebSockets) per architecture spec.
 *
 * @param {Function} fetchFn - async function to call on each interval
 * @param {number} intervalMs - polling interval in ms (5000–10000)
 * @param {boolean} enabled - whether polling is active
 */
import { useState, useEffect, useRef } from 'react'

export function usePolling(fetchFn, intervalMs = 7000, enabled = true) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const poll = async () => {
      try {
        const res = await fetchFn()
        setData(res.data)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    poll()
    timerRef.current = setInterval(poll, intervalMs)

    return () => clearInterval(timerRef.current)
  }, [fetchFn, intervalMs, enabled])

  return { data, error, loading }
}
