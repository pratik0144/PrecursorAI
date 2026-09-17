import { 
  Report, ReportStatus, ReportType, 
  Alert, AlertStatus, AlertSource, Severity, 
  Pattern, PatternType, PatternPriority 
} from '../types'

export const mockReports: Report[] = [
  {
    id: 'REP-4091',
    report_text: 'A 4-inch drill pipe dropped from crane during lifting operations near Wellhead #44. Operator was standing near drop zone line-of-fire.',
    report_type: ReportType.NEAR_MISS,
    status: ReportStatus.ANALYZED,
    location: 'Assam / Duliajan',
    asset_id: 'Wellhead WH-44',
    is_synthetic: true,
    created_at: new Date().toISOString()
  }
]

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-801',
    title: 'Compounding Barrier Failure at Baghjan Wellhead #44',
    message: 'Multiple observations of bypassed safety valves combined with high pressure readings.',
    status: AlertStatus.OPEN,
    source: AlertSource.PATTERN,
    severity: Severity.CRITICAL,
    created_at: new Date().toISOString()
  }
]

export const mockPatterns: Pattern[] = [
  {
    id: 'PAT-01',
    title: 'Compounding Barrier Failure on Wellhead WH-44',
    description: 'Repeated barrier degradation events detected on single high-pressure asset.',
    pattern_type: PatternType.COMPOUNDING,
    priority: PatternPriority.CRITICAL,
    report_count: 5,
    status: 'ACTIVE'
  }
]
