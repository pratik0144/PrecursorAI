from typing import Optional, Dict
from pydantic import BaseModel
import uuid
from datetime import datetime

class IOGPRuleResponse(BaseModel):
    id: str
    name: str
    description: str

class EnergySourceResponse(BaseModel):
    id: str
    type_name: str
    default_magnitude: Optional[str]

class BarrierResponse(BaseModel):
    id: str
    name: str
    description: str

class OISDReferenceResponse(BaseModel):
    id: str
    standard_number: str
    description: str
    verified: bool

class RulesetVersionResponse(BaseModel):
    id: uuid.UUID
    version_tag: str
    config_weights: Dict
    created_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}
