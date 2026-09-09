from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class RiskEventResponse(BaseModel):
    id: int
    shipment_id: int
    event_type: str
    severity: float
    description: str
    timestamp: datetime

    class Config:
        from_attributes = True


class RiskScoreResponse(BaseModel):
    id: int
    shipment_id: int
    risk_score: float
    sla_probability: float
    estimated_delay: float
    timestamp: datetime

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: int
    shipment_id: int
    action: str
    description: str
    expected_risk_reduction: float
    expected_delay_reduction: float
    priority: str

    class Config:
        from_attributes = True


from schemas.notification import NotificationResponse  # Re-export for convenience


class ShipmentSummary(BaseModel):
    id: int
    tracking_number: str
    origin: str
    destination: str
    current_location: str
    status: str
    expected_delivery: datetime
    sla_deadline: datetime
    created_at: datetime
    latest_risk_score: float
    latest_sla_probability: float
    latest_estimated_delay: float
    risk_tier: str  # LOW, MEDIUM, HIGH, CRITICAL

    class Config:
        from_attributes = True


class ShipmentDetail(BaseModel):
    id: int
    tracking_number: str
    origin: str
    destination: str
    current_location: str
    status: str
    expected_delivery: datetime
    sla_deadline: datetime
    created_at: datetime
    latest_risk_score: float
    latest_sla_probability: float
    latest_estimated_delay: float
    risk_tier: str
    factor_breakdown: dict
    risk_events: List[RiskEventResponse] = []
    risk_scores: List[RiskScoreResponse] = []
    recommendations: List[RecommendationResponse] = []
    notifications: List[NotificationResponse] = []

    class Config:
        from_attributes = True
