from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CustomerShipmentView(BaseModel):
    """
    CUSTOMER ROLE VIEW
    Contains ONLY:
    - New ETA (e.g. 'Arriving by 8:36 PM IST')
    - Simple plain-language reason for delay (e.g. 'Delayed due to severe weather & highway traffic')
    - Reassurance / status message (e.g. 'We are actively rerouting to minimize delay')
    - Basic shipment metadata (tracking number, origin, destination, last checkpoint)

    Explicitly EXCLUDES:
    - Internal risk scores / mathematical formulas (0-10)
    - Vehicle telemetry (speed, fuel %, battery, cold-chain temperature)
    - Dispatcher operations, truck telematics, internal driver IDs
    - Warehouse dock bottleneck metrics and operating costs
    """
    tracking_number: str
    origin: str
    destination: str
    delivery_status: str
    new_eta: str
    is_delayed: bool
    delay_reason: Optional[str] = None
    reassurance_message: str
    last_checkpoint: str
    carrier: str = "UPS Worldwide Express"
    role_audit: str = "DATA_SEPARATION_ENFORCED: Risk scores, vehicle telemetry, and operational costs omitted."


class DriverShipmentView(BaseModel):
    """
    DRIVER ROLE VIEW
    Contains ONLY:
    - Actionable turn-by-turn reroute instruction (e.g. 'Divert at Vellore exit via Highway NH-75')
    - Assigned destination facility & bay (e.g. 'Proceed to Bangalore Hub B, Bay 4')
    - Route-specific hazard warning (e.g. 'Severe flooding & 18 km/h gridlock reported on NH-48')
    - Truck ID, route status, speed advisory, and distance remaining

    Explicitly EXCLUDES:
    - Customer Personal Identifiable Information (PII) - phone numbers, home addresses, billing details
    - Contractual SLA penalty dollar figures or customer corporate priority tier
    - Fleet-wide executive KPI charts and multi-shipment historical analytics
    """
    truck_id: str
    tracking_number: str
    driver_name: str
    current_corridor: str
    route_status: str
    reroute_instruction: Optional[str] = None
    assigned_destination: str
    route_hazard_warning: Optional[str] = None
    speed_limit_advisory: str
    distance_remaining_km: float
    dispatched_at: str
    role_audit: str = "DATA_SEPARATION_ENFORCED: Customer PII, contractual penalties, and fleet KPIs omitted."


class ControlTowerShipmentView(BaseModel):
    """
    CONTROL TOWER / DISPATCHER ROLE VIEW
    Contains the FULL operational picture:
    - SVG risk gauge value (0-10) with exact mathematical factor breakdown
    - Vehicle telemetry HUD (speed, fuel %, cold-chain temp, battery %)
    - Compound weighted risk calculation (+2.1 Weather, +1.7 Traffic, +1.4 Hub Delay)
    - AI root-cause synthesis and prescriptive recommendations for approval
    """
    id: int
    tracking_number: str
    origin: str
    destination: str
    current_location: str
    status: str
    expected_delivery: str
    sla_deadline: str
    risk_score: float
    risk_tier: str
    sla_breach_probability: float
    estimated_delay_hours: float
    vehicle_telemetry: Dict[str, Any]
    compound_risk_factors: Dict[str, Any]
    recent_events: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    role_audit: str = "FULL_ACCESS: Complete operational, mathematical, and telemetry transparency."
