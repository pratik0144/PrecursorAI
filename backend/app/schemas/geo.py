from typing import Optional, List
from pydantic import BaseModel
import uuid

class GeoAggregateResponse(BaseModel):
    level: str
    region_name: str
    coordinates: List[float]
    precursor_density: float
    risk_score_avg: float
    report_count: int

class AssetGeoResponse(BaseModel):
    asset_id: uuid.UUID
    asset_name: str
    asset_type: str
    coordinates: List[float]
    status: str
