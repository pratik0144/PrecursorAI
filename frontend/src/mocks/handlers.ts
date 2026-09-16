import { http, HttpResponse } from 'msw'
import { mockReports, mockAlerts, mockPatterns } from './fixtures'

export const handlers = [
  http.get('/api/v1/reports', () => {
    return HttpResponse.json({
      data: mockReports,
      total: mockReports.length,
      page: 1,
      size: 50
    })
  }),
  http.get('/api/v1/alerts', () => {
    return HttpResponse.json({
      data: mockAlerts,
      total: mockAlerts.length,
      page: 1,
      size: 50
    })
  }),
  http.get('/api/v1/patterns', () => {
    return HttpResponse.json({
      data: mockPatterns,
      total: mockPatterns.length,
      page: 1,
      size: 50
    })
  }),
  http.get('/api/v1/dashboard/summary', () => {
    return HttpResponse.json({
      total_reports: 1245,
      sif_potential: 142,
      open_alerts: 12,
      active_patterns: 4
    })
  })
]
