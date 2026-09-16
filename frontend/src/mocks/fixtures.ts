import { Report, ReportStatus, ReportType, SifClassification, EscalationLevel, Alert, AlertStatus, AlertSource, Severity, Pattern, PatternType, PatternPriority } from '../types'

export const mockReports: Report[] = [
  {
    id: 'rep-001',
    report_type: ReportType.INCIDENT,
    title: 'Dropped pipe during lifting operation',
    raw_text: 'A 4-inch pipe dropped from the crane during lifting operations near the Baghjan site. Operator was standing near the drop zone but was not hit.',
    date_reported: new Date().toISOString(),
    status: ReportStatus.PROCESSED,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockAlerts: Alert[] = [
  {
    id: 'alt-001',
    title: 'Compounding Barrier Failure at Baghjan',
    description: 'Multiple observations of bypassed safety valves combined with high pressure readings.',
    status: AlertStatus.OPEN,
    source: AlertSource.PATTERN_SWEEP,
    severity: Severity.CRITICAL,
    report_ids: ['rep-001'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockPatterns: Pattern[] = [
  {
    id: 'pat-001',
    title: 'Crane Operations Deviation',
    description: 'Repeated dropped objects in region alpha.',
    type: PatternType.EQUIPMENT,
    priority: PatternPriority.HIGH,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]
