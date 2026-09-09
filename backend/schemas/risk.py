from typing import List, Optional
from pydantic import BaseModel, Field


class SimulateEventRequest(BaseModel):
    event_type: str = Field(..., description="WEATHER, TRAFFIC, HUB_DELAY, FLIGHT, GEOPOLITICAL")
    severity: int = Field(..., ge=1, le=10, description="Severity from 1 to 10")
    description: Optional[str] = None


class WhatIfRequest(BaseModel):
    weather: float = Field(..., ge=0, le=10)
    traffic: float = Field(..., ge=0, le=10)
    hub_delay: float = Field(..., ge=0, le=10)
    historical: Optional[float] = Field(default=3.0, ge=0, le=10)
    geopolitical: Optional[float] = Field(default=2.0, ge=0, le=10)
    shipment_factor: Optional[float] = Field(default=2.0, ge=0, le=10)
    action: Optional[str] = Field(default=None, description="Reroute, Priority Transport, Alternate Hub")


class WhatIfResponse(BaseModel):
    before_risk: float
    before_delay: float
    before_sla_prob: float
    after_risk: float
    after_delay: float
    after_sla_prob: float
    action: Optional[str]
    time_saved: float
    sla_recovery: float


class AIRecommendationResponse(BaseModel):
    summary: str
    causes: List[str]
    prediction: str
    recommendations: List[dict]  # list of {action, description, expected_delay_reduction, priority}
    model_used: Optional[str] = "Google Gemini 1.5 Flash"


class ApplyActionRequest(BaseModel):
    action: str
    description: Optional[str] = None
    expected_delay_reduction: Optional[float] = 4.5
    expected_risk_reduction: Optional[float] = 4.1
