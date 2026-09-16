import enum
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

class UserRole(str, enum.Enum):
    HSSE_OFFICER = "HSSE_OFFICER"
    SITE_MANAGER = "SITE_MANAGER"
    OPS_MANAGER = "OPS_MANAGER"
    CORPORATE_LEADERSHIP = "CORPORATE_LEADERSHIP"
    ADMIN = "ADMIN"

class ReportType(str, enum.Enum):
    SAFETY_OBSERVATION = "SAFETY_OBSERVATION"
    NEAR_MISS = "NEAR_MISS"
    UNSAFE_ACT = "UNSAFE_ACT"
    UNSAFE_CONDITION = "UNSAFE_CONDITION"
    INCIDENT = "INCIDENT"
    HIPO_NEAR_MISS = "HIPO_NEAR_MISS"

class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    ANALYZED = "ANALYZED"
    REVIEW = "REVIEW"
    CLOSED = "CLOSED"

class EnergyType(str, enum.Enum):
    GRAVITY = "GRAVITY"
    MOTION = "MOTION"
    MECHANICAL = "MECHANICAL"
    ELECTRICAL = "ELECTRICAL"
    PRESSURE = "PRESSURE"
    TEMPERATURE = "TEMPERATURE"
    CHEMICAL = "CHEMICAL"
    RADIATION = "RADIATION"
    FIRE_EXPLOSION = "FIRE_EXPLOSION"
    SOUND = "SOUND"
    BIOLOGICAL = "BIOLOGICAL"

class BarrierStatus(str, enum.Enum):
    INTACT = "INTACT"
    DEGRADED = "DEGRADED"
    MISSING = "MISSING"
    BYPASSED = "BYPASSED"
    FAILED = "FAILED"
    UNKNOWN = "UNKNOWN"

class SifClassification(str, enum.Enum):
    HSIF = "HSIF"
    PSIF = "PSIF"
    LSIF = "LSIF"
    CAPACITY = "CAPACITY"
    EXPOSURE = "EXPOSURE"
    LOW_ENERGY = "LOW_ENERGY"
    UNDETERMINED = "UNDETERMINED"

class EscalationLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    REVIEW = "REVIEW"
    ROUTINE = "ROUTINE"

class Severity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class PatternType(str, enum.Enum):
    RECURRING = "RECURRING"
    EMERGING = "EMERGING"
    COMPOUNDING = "COMPOUNDING"
    SYSTEMIC = "SYSTEMIC"

class PatternPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_REVIEW = "IN_REVIEW"
    ESCALATED = "ESCALATED"
    CLOSED = "CLOSED"
    DISMISSED = "DISMISSED"

class AlertSource(str, enum.Enum):
    REPORT = "REPORT"
    PATTERN = "PATTERN"

class EmbeddingStatus(str, enum.Enum):
    OK = "OK"
    DEGRADED = "DEGRADED"
    PENDING = "PENDING"

class LocationLevel(str, enum.Enum):
    WORLD = "WORLD"
    COUNTRY = "COUNTRY"
    REGION = "REGION"
    FIELD = "FIELD"
    SITE = "SITE"

class AssetType(str, enum.Enum):
    DRILLING_RIG = "DRILLING_RIG"
    WORKOVER_RIG = "WORKOVER_RIG"
    WELLHEAD = "WELLHEAD"
    BOP_WELL_CONTROL = "BOP_WELL_CONTROL"
    PRODUCTION_FIELD = "PRODUCTION_FIELD"
    COMPRESSOR_STATION = "COMPRESSOR_STATION"
    PUMPING_UNIT = "PUMPING_UNIT"
    OIL_COLLECTION_STATION = "OIL_COLLECTION_STATION"
    GGS = "GGS"
    PIPELINE = "PIPELINE"

# SQLAlchemy ENUMs
user_role_enum = PgEnum(UserRole, name='user_role', create_type=False)
report_type_enum = PgEnum(ReportType, name='report_type', create_type=False)
report_status_enum = PgEnum(ReportStatus, name='report_status', create_type=False)
energy_type_enum = PgEnum(EnergyType, name='energy_type', create_type=False)
barrier_status_enum = PgEnum(BarrierStatus, name='barrier_status', create_type=False)
sif_classification_enum = PgEnum(SifClassification, name='sif_classification', create_type=False)
escalation_level_enum = PgEnum(EscalationLevel, name='escalation_level', create_type=False)
severity_enum = PgEnum(Severity, name='severity', create_type=False)
pattern_type_enum = PgEnum(PatternType, name='pattern_type', create_type=False)
pattern_priority_enum = PgEnum(PatternPriority, name='pattern_priority', create_type=False)
alert_status_enum = PgEnum(AlertStatus, name='alert_status', create_type=False)
alert_source_enum = PgEnum(AlertSource, name='alert_source', create_type=False)
embedding_status_enum = PgEnum(EmbeddingStatus, name='embedding_status', create_type=False)
location_level_enum = PgEnum(LocationLevel, name='location_level', create_type=False)
asset_type_enum = PgEnum(AssetType, name='asset_type', create_type=False)
