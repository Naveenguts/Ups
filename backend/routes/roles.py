from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from schemas.roles import (
    CustomerShipmentView,
    DriverShipmentView,
    ControlTowerShipmentView,
)
from services.risk_engine import (
    calculate_risk_score,
    calculate_sla_breach_probability,
    calculate_estimated_delay,
    get_risk_tier,
)

router = APIRouter(prefix="/api/roles", tags=["Role-Based Views"])


async def _get_shipment_with_relations(db: AsyncSession, tracking_number: str) -> Shipment:
    """Helper to fetch single-source shipment entity."""
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_scores),
            selectinload(Shipment.risk_events),
            selectinload(Shipment.recommendations),
            selectinload(Shipment.notifications),
        )
        .where(
            (Shipment.tracking_number == tracking_number)
            | (Shipment.id == int(tracking_number) if tracking_number.isdigit() else False)
        )
    )
    res = await db.execute(stmt)
    shipment = res.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment '{tracking_number}' not found")
    return shipment


# ----------------------------------------------------------------------
# 1. CUSTOMER VIEW ENDPOINT
# ----------------------------------------------------------------------
@router.get("/customer/{tracking_number}", response_model=CustomerShipmentView)
async def get_customer_view(tracking_number: str, db: AsyncSession = Depends(get_db)):
    """
    Returns ONLY information relevant to the recipient customer.
    STRICTLY EXCLUDES:
    - Internal risk scores & mathematical formulas
    - Vehicle telematics & telemetry
    - Dispatcher operations & driver identifiers
    - Warehouse queue bottlenecks and operational costs
    """
    shipment = await _get_shipment_with_relations(db, tracking_number)

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    delay = latest_score.estimated_delay if latest_score else 0.6
    is_delayed = delay > 1.2 or shipment.status in ("DELAYED", "REROUTED")

    # 1. Format Plain English ETA
    new_delivery_dt = shipment.expected_delivery + timedelta(hours=delay)
    new_eta_str = f"Arriving today by {new_delivery_dt.strftime('%I:%M %p IST')}"

    # 2. Derive Plain-Language Reason for Delay
    delay_reason: Optional[str] = None
    if shipment.status == "REROUTED":
        delay_reason = "Corridor congestion bypassed via expedited alternate route"
        delivery_status = "Rerouted for Speed (Delay Minimized)"
        reassurance = "Your package has been rerouted onto an expedited alternate corridor to prevent further delays. Delivery is on track."
    elif is_delayed:
        delivery_status = "Delivery Rescheduled — Delay Expected"
        # Find latest active risk event to explain in plain customer language
        events = sorted(shipment.risk_events, key=lambda x: x.timestamp)
        latest_event = events[-1] if events else None
        if latest_event and latest_event.event_type == "WEATHER":
            delay_reason = "Delayed due to heavy rainfall & road waterlogging along highway transit corridor"
        elif latest_event and latest_event.event_type == "TRAFFIC":
            delay_reason = "Delayed due to severe highway traffic congestion and maintenance bottlenecks"
        elif latest_event and latest_event.event_type == "HUB_DELAY":
            delay_reason = "Delayed due to temporary regional sorting facility terminal congestion"
        else:
            delay_reason = "Delayed due to adverse transit corridor weather and high highway traffic volume"
        reassurance = "We are actively rerouting your package and coordinating regional priority transport to minimize delay."
    else:
        delivery_status = "On Schedule — Transit Normal"
        delay_reason = None
        reassurance = "Your package is traveling smoothly on its primary express transit corridor."

    return CustomerShipmentView(
        tracking_number=shipment.tracking_number,
        origin=shipment.origin,
        destination=shipment.destination,
        delivery_status=delivery_status,
        new_eta=new_eta_str,
        is_delayed=is_delayed,
        delay_reason=delay_reason,
        reassurance_message=reassurance,
        last_checkpoint=shipment.current_location,
        carrier="UPS Worldwide Express",
        role_audit="DATA_SEPARATION_ENFORCED: Risk scores, vehicle telemetry, and operational costs omitted.",
    )


# ----------------------------------------------------------------------
# 2. DRIVER VIEW ENDPOINT
# ----------------------------------------------------------------------
@router.get("/driver/{tracking_number}", response_model=DriverShipmentView)
async def get_driver_view(tracking_number: str, db: AsyncSession = Depends(get_db)):
    """
    Returns ONLY navigational and safety instructions for the commercial fleet driver.
    STRICTLY EXCLUDES:
    - Customer Personal Identifiable Information (PII) - phone, full address, recipient name
    - Contractual SLA penalty dollar figures or corporate priority tiers
    - Fleet-wide KPI charts and historical analytics
    """
    shipment = await _get_shipment_with_relations(db, tracking_number)

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    delay = latest_score.estimated_delay if latest_score else 0.6

    is_rerouted = shipment.status == "REROUTED"

    # Route status & actionable turn-by-turn instruction
    if is_rerouted:
        route_status = "TACTICAL_REROUTE_ASSIGNED"
        reroute_instruction = "DIVERT AT VELLORE EXIT (KM-128): Take Highway NH-75 expressway via Chittoor & Kolar bypass."
        assigned_dest = "Bangalore Hub B (North Logistics Center), Bay 4 - Expedited Inbound"
        dist_remaining = 178.0
        speed_advisory = "65 km/h (Expressway bypass limits)"
    elif delay > 3.0:
        route_status = "REROUTE_ADVISORY_PENDING"
        reroute_instruction = "PREPARE FOR DIVERSION: Dispatcher evaluating Route B bypass. Stand by for Vellore exit instructions."
        assigned_dest = "Bangalore Hub A (Central Terminal), Standby Bay"
        dist_remaining = 214.5
        speed_advisory = "50 km/h (Hazardous conditions ahead)"
    else:
        route_status = "ON_STANDARD_ROUTE"
        reroute_instruction = "MAINTAIN COURSE: Stay on primary NH-48 corridor toward Bangalore."
        assigned_dest = "Bangalore Hub A (Main Terminal), Dock Bay 12"
        dist_remaining = 214.5
        speed_advisory = "75 km/h (Standard corridor cruising limit)"

    # Hazard warnings relevant only to route safety
    events = sorted(shipment.risk_events, key=lambda x: x.timestamp)
    hazards = []
    for e in events:
        if e.event_type == "WEATHER" and e.severity >= 6:
            hazards.append(f"Heavy flash flooding reported on NH-48 (Severity: {e.severity}/10)")
        elif e.event_type == "TRAFFIC" and e.severity >= 6:
            hazards.append(f"Highway gridlock near Ambur; transit speed slowed to 18 km/h (Severity: {e.severity}/10)")

    hazard_warning = " • ".join(hazards) if hazards else "Corridor clear: Normal highway transit conditions reported."

    return DriverShipmentView(
        truck_id="UPS-TRK-8821",
        tracking_number=shipment.tracking_number,
        driver_name="M. Rajesh (Fleet Sector 4)",
        current_corridor=shipment.current_location,
        route_status=route_status,
        reroute_instruction=reroute_instruction,
        assigned_destination=assigned_dest,
        route_hazard_warning=hazard_warning,
        speed_limit_advisory=speed_advisory,
        distance_remaining_km=dist_remaining,
        dispatched_at=datetime.utcnow().strftime("%I:%M %p UTC"),
        role_audit="DATA_SEPARATION_ENFORCED: Customer PII, contractual penalties, and fleet KPIs omitted.",
    )


# ----------------------------------------------------------------------
# 3. CONTROL TOWER / DISPATCHER VIEW ENDPOINT
# ----------------------------------------------------------------------
@router.get("/control-tower/{tracking_number}", response_model=ControlTowerShipmentView)
async def get_control_tower_view(tracking_number: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the FULL operational command view for operations managers and dispatchers:
    - SVG risk gauge value (0-10) with exact mathematical factor breakdown
    - Vehicle telemetry HUD (speed, fuel %, cold-chain temp, battery %)
    - Compound weighted risk calculation (+2.1 Weather, +1.7 Traffic, +1.4 Hub Delay)
    - AI root-cause synthesis and prescriptive recommendations for approval
    """
    shipment = await _get_shipment_with_relations(db, tracking_number)

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    risk_score = latest_score.risk_score if latest_score else 2.8
    sla_prob = latest_score.sla_probability if latest_score else 12.0
    delay = latest_score.estimated_delay if latest_score else 0.6

    # Compound factor weights
    severities = {"WEATHER": 2.0, "TRAFFIC": 2.0, "HUB_DELAY": 1.0}
    for e in shipment.risk_events:
        if e.event_type in severities:
            severities[e.event_type] = float(e.severity)

    weather_contrib = round(severities["WEATHER"] * 0.35, 1)
    traffic_contrib = round(severities["TRAFFIC"] * 0.30, 1)
    hub_contrib = round(severities["HUB_DELAY"] * 0.20, 1)
    historical_contrib = 0.6

    recent_events = [
        {
            "id": e.id,
            "type": e.event_type,
            "severity": e.severity,
            "description": e.description,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in sorted(shipment.risk_events, key=lambda x: x.timestamp, reverse=True)[:5]
    ]

    recs = [
        {
            "id": r.id,
            "action": r.action,
            "description": r.description,
            "expected_delay_reduction": r.expected_delay_reduction,
            "expected_risk_reduction": r.expected_risk_reduction,
            "priority": r.priority,
        }
        for r in shipment.recommendations
    ]

    # Telemetry HUD
    telemetry = {
        "vehicle_id": "UPS-TRK-8821",
        "speed_kmh": 32 if severities["TRAFFIC"] >= 7 else 68,
        "fuel_percent": 84,
        "cold_chain_temp_c": 4.2,
        "telematics_status": "ONLINE_ACTIVE",
        "engine_health": "OPTIMAL",
        "gps_coordinates": "12.9165° N, 79.1325° E",
    }

    return ControlTowerShipmentView(
        id=shipment.id,
        tracking_number=shipment.tracking_number,
        origin=shipment.origin,
        destination=shipment.destination,
        current_location=shipment.current_location,
        status=shipment.status,
        expected_delivery=shipment.expected_delivery.isoformat(),
        sla_deadline=shipment.sla_deadline.isoformat(),
        risk_score=risk_score,
        risk_tier=get_risk_tier(risk_score),
        sla_breach_probability=sla_prob,
        estimated_delay_hours=delay,
        vehicle_telemetry=telemetry,
        compound_risk_factors={
            "weather_contribution": weather_contrib,
            "traffic_contribution": traffic_contrib,
            "hub_contribution": hub_contrib,
            "historical_contribution": historical_contrib,
            "formula": "Risk = (Weather×0.35) + (Traffic×0.30) + (Hub×0.20) + (Historical×0.15)",
        },
        recent_events=recent_events,
        recommendations=recs,
        role_audit="FULL_ACCESS: Complete operational, mathematical, and telemetry transparency.",
    )
