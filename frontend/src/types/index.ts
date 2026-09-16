// ────────────────────────────────────────────────────────────────────────────
// PrecursorAI Domain Types — mirrors backend Pydantic models & PostgreSQL enums
// ────────────────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  HSSE_OFFICER = 'HSSE_OFFICER',
  SITE_MANAGER = 'SITE_MANAGER',
  OPS_MANAGER = 'OPS_MANAGER',
  CORPORATE_LEADERSHIP = 'CORPORATE_LEADERSHIP',
  ADMIN = 'ADMIN',
}

export enum ReportType {
  SAFETY_OBSERVATION = 'SAFETY_OBSERVATION',
  NEAR_MISS = 'NEAR_MISS',
  UNSAFE_ACT = 'UNSAFE_ACT',
  UNSAFE_CONDITION = 'UNSAFE_CONDITION',
  INCIDENT = 'INCIDENT',
  HIPO_NEAR_MISS = 'HIPO_NEAR_MISS',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  ANALYZED = 'ANALYZED',
  REVIEW = 'REVIEW',
  CLOSED = 'CLOSED',
}

export enum EnergyType {
  GRAVITY = 'GRAVITY',
  MOTION = 'MOTION',
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  PRESSURE = 'PRESSURE',
  TEMPERATURE = 'TEMPERATURE',
  CHEMICAL = 'CHEMICAL',
  RADIATION = 'RADIATION',
  FIRE_EXPLOSION = 'FIRE_EXPLOSION',
  SOUND = 'SOUND',
  BIOLOGICAL = 'BIOLOGICAL',
}

export enum BarrierStatus {
  INTACT = 'INTACT',
  DEGRADED = 'DEGRADED',
  MISSING = 'MISSING',
  BYPASSED = 'BYPASSED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

export enum SifClassification {
  HSIF = 'HSIF',
  PSIF = 'PSIF',
  LSIF = 'LSIF',
  CAPACITY = 'CAPACITY',
  EXPOSURE = 'EXPOSURE',
  LOW_ENERGY = 'LOW_ENERGY',
  UNDETERMINED = 'UNDETERMINED',
}

export enum EscalationLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  REVIEW = 'REVIEW',
  ROUTINE = 'ROUTINE',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum PatternType {
  RECURRING = 'RECURRING',
  EMERGING = 'EMERGING',
  COMPOUNDING = 'COMPOUNDING',
  SYSTEMIC = 'SYSTEMIC',
}

export enum PatternPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_REVIEW = 'IN_REVIEW',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
  DISMISSED = 'DISMISSED',
}

export enum AlertSource {
  REPORT = 'REPORT',
  PATTERN = 'PATTERN',
}

export enum EmbeddingStatus {
  OK = 'OK',
  DEGRADED = 'DEGRADED',
  PENDING = 'PENDING',
}

export enum LocationLevel {
  WORLD = 'WORLD',
  COUNTRY = 'COUNTRY',
  REGION = 'REGION',
  FIELD = 'FIELD',
  SITE = 'SITE',
}

export enum AssetType {
  DRILLING_RIG = 'DRILLING_RIG',
  WORKOVER_RIG = 'WORKOVER_RIG',
  WELLHEAD = 'WELLHEAD',
  BOP_WELL_CONTROL = 'BOP_WELL_CONTROL',
  PRODUCTION_FIELD = 'PRODUCTION_FIELD',
  COMPRESSOR_STATION = 'COMPRESSOR_STATION',
  PUMPING_UNIT = 'PUMPING_UNIT',
  OIL_COLLECTION_STATION = 'OIL_COLLECTION_STATION',
  GGS = 'GGS',
  PIPELINE = 'PIPELINE',
}

// ── Domain Interfaces ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  org_id: string;
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_demo: boolean;
}

export interface IOGPRule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
}

export interface OISDReference {
  id: string;
  standard_no: string;
  title: string;
  summary: string;
  concept_tag?: string;
  url?: string;
  verified: boolean;
}

export interface EnergySource {
  id: string;
  code: string;
  name: string;
  energy_type: EnergyType;
  typical_context?: string;
  is_high_energy: boolean;
  threshold_joules?: number;
}

export interface Barrier {
  id: string;
  code: string;
  name: string;
  description: string;
  is_direct_control: boolean;
  related_energy_type?: EnergyType;
}

export interface RulesetVersion {
  id: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  parent_id?: string;
  level: LocationLevel;
  name: string;
  code?: string;
  latitude?: number;
  longitude?: number;
  children?: Location[];
}

export interface Asset {
  id: string;
  org_id: string;
  location_id: string;
  asset_type: AssetType;
  name: string;
  code?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  is_synthetic: boolean;
}

// ── Report & Analysis ────────────────────────────────────────────────────────

export interface ExtractionPassA {
  hazard: string;
  energy_sources: Array<{ id: string; name: string; energy_type: EnergyType; magnitude?: string; is_high_energy: boolean }>;
  activity: string;
  person_in_danger_zone: boolean;
  barriers: Array<{ id: string; name: string; status: BarrierStatus }>;
  iogp_rules: Array<{ id: string; code: string; name: string }>;
  oisd_references: Array<{ id: string; standard_no: string; is_hipo: boolean }>;
  severity: Severity;
}

export interface ExtractionPassB {
  sif_reasoning: string;
  rationale: string;
  confidence_score: number;
  requires_followup: boolean;
  followup_question?: string;
}

export interface ClassificationResult {
  high_energy_present: boolean;
  person_in_danger_zone: boolean;
  barrier_compromised: boolean;
  sif_classification: SifClassification;
  escalation_level: EscalationLevel;
  risk_score: number;
  confidence: number;
  risk_score_breakdown?: {
    barrier_weight: number;
    severity_weight: number;
    sif_bonus: number;
    confidence_penalty: number;
  };
  ruleset_version_id?: string;
}

export interface ReportAnalysis {
  id: string;
  report_id: string;
  high_energy_present?: boolean;
  person_in_danger_zone?: boolean;
  barrier_compromised?: boolean;
  sif_classification?: SifClassification;
  escalation_level?: EscalationLevel;
  ruleset_version_id?: string;
  confidence: number;
  risk_score: number;
  severity: Severity;
  rationale?: string;
  requires_followup: boolean;
  followup_question?: string;
  energy_source?: string;
  barrier?: string;
  barrier_status?: string;
  iogp_rule?: string;
}

export interface Report {
  id: string;
  report_text: string;
  report_type: ReportType;
  status: ReportStatus;
  location?: string;
  asset_id?: string;
  location_id?: string;
  asset_uuid?: string;
  reporter_name?: string;
  reporter_role?: string;
  is_synthetic: boolean;
  source?: string;
  created_at: string;
  analysis?: ReportAnalysis;
}

export interface ReportDetail extends Report {
  extraction?: {
    pass_a: ExtractionPassA;
    pass_b?: ExtractionPassB;
    rag_chunks?: Array<{ id: string; title: string; chunk_text: string; source: string }>;
  };
  classification?: ClassificationResult;
  similar_reports?: Array<{ id: string; similarity_score: number }>;
  related_patterns?: Array<{ id: string; title: string; pattern_type: PatternType }>;
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface AlertEvent {
  id: string;
  alert_id: string;
  from_status?: AlertStatus;
  to_status: AlertStatus;
  actor_id?: string;
  note?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  report_id?: string;
  pattern_id?: string;
  status: AlertStatus;
  source?: AlertSource;
  severity: Severity;
  title: string;
  message: string;
  assignee_id?: string;
  sla_due_at?: string;
  acknowledged_at?: string;
  escalated_at?: string;
  closed_at?: string;
  created_at: string;
  events?: AlertEvent[];
}

// ── Patterns ─────────────────────────────────────────────────────────────────

export interface Pattern {
  id: string;
  pattern_type: PatternType;
  title: string;
  description: string;
  asset_id?: string;
  location?: string;
  hazard?: string;
  barrier?: string;
  priority: PatternPriority;
  confidence?: number;
  report_count: number;
  first_seen?: string;
  last_seen?: string;
  status: string;
  evidence?: unknown[];
  contributing_reports?: Array<{ report_id: string; similarity_score?: number }>;
}

export interface SweepRun {
  id: string;
  candidates: number;
  clusters_found: number;
  patterns_created: number;
  status: string;
  started_at: string;
  finished_at?: string;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface SifFunnelData {
  total_reports: number;
  high_energy: number;
  sif_potential: number;
  escalated: number;
}

export interface DashboardSummary {
  total_reports: number;
  reports_today: number;
  reports_7d: number;
  sif_potential_count: number;
  active_alerts: number;
  unread_alerts: number;
  active_patterns: number;
  mean_time_to_triage_minutes?: number;
  barrier_failure_rate?: number;
  funnel: SifFunnelData;
  risk_breakdown: {
    routine: number;
    review: number;
    high: number;
    sif: number;
  };
  top_assets_by_reports: Array<{ asset_id: string; name: string; count: number }>;
  top_hazards: Array<{ hazard: string; count: number }>;
}

// ── Geo ──────────────────────────────────────────────────────────────────────

export interface GeoAggregate {
  id: string;
  name: string;
  level: LocationLevel;
  latitude: number;
  longitude: number;
  report_count: number;
  sif_count: number;
  escalation_count: number;
  children?: GeoAggregate[];
}

export interface AssetGeo {
  id: string;
  name: string;
  asset_type: AssetType;
  latitude: number;
  longitude: number;
  risk_score?: number;
  escalation_level?: EscalationLevel;
  is_synthetic: boolean;
}

// ── Generic ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
