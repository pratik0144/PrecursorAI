"""
schemas/alert.py — Pydantic schemas for alerts
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: uuid.UUID
    report_id: Optional[uuid.UUID]
    pattern_id: Optional[uuid.UUID]
    alert_type: str
    severity: str
    title: str
    message: str
    is_read: bool
    status: str
    source: str
    assignee_id: Optional[uuid.UUID]
    sla_deadline: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
