from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.risk import RiskEvent, RiskScore
from services.traffic_service import fetch_live_corridor_traffic
from services.risk_engine import (
    calculate_risk_score,
    calculate_sla_breach_probability,
    calculate_estimated_delay,
    get_risk_tier,
)

router = APIRouter(prefix="/api/traffic", tags=["Real-Time Traffic"])


@router.get("/live")
async def get_corridor_traffic(city: str = Query("Vellore", description="Transit corridor checkpoint city")):
    """
    Returns real-time highway traffic flow, velocity, and congestion delays from TomTom Traffic API.
    """
    return fetch_live_corridor_traffic(city)


@router.post("/sync/{shipment_id}")
async def sync_shipment_traffic(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Syncs live real-time TomTom GPS traffic speed for the shipment's current corridor,
    dynamically recalculating the risk score from live road conditions.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_events),
            selectinload(Shipment.risk_scores),
        )
        .where(Shipment.id == shipment_id)
    )
    res = await db.execute(stmt)
    shipment = res.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    city = "Vellore"
    loc_lower = (shipment.current_location or "").lower()
    if "surat" in loc_lower:
        city = "Surat"
    elif "chennai" in loc_lower:
        city = "Chennai"
    elif "bangalore" in loc_lower or "bengaluru" in loc_lower:
        city = "Bangalore"
    elif "mumbai" in loc_lower:
        city = "Mumbai"
    elif "delhi" in loc_lower:
        city = "Delhi"

    traffic_data = fetch_live_corridor_traffic(city)
    severity = float(traffic_data.get("severity", 2.0))
    summary = traffic_data.get("summary", f"Live traffic synced for {city}")

    # Add new risk event
    risk_event = RiskEvent(
        shipment_id=shipment_id,
        event_type="TRAFFIC",
        severity=severity,
        description=f"[TomTom Live GPS] {summary}",
        timestamp=datetime.utcnow(),
    )
    db.add(risk_event)

    # Recalculate risk
    severities = {"WEATHER": 2.0, "TRAFFIC": severity, "HUB_DELAY": 1.0}
    for e in shipment.risk_events:
        if e.event_type in ("WEATHER", "HUB_DELAY", "PORT_DELAY"):
            severities[e.event_type] = float(e.severity)

    new_risk = calculate_risk_score(
        weather=severities.get("WEATHER", 2.0),
        traffic=severities["TRAFFIC"],
        hub=severities.get("HUB_DELAY", 1.0),
    )
    sla_prob = calculate_sla_breach_probability(new_risk)
    est_delay = calculate_estimated_delay(new_risk)

    risk_score = RiskScore(
        shipment_id=shipment_id,
        risk_score=new_risk,
        sla_probability=sla_prob,
        estimated_delay=est_delay,
        timestamp=datetime.utcnow(),
    )
    db.add(risk_score)
    await db.commit()
    await db.refresh(risk_score)

    return {
        "success": True,
        "shipment_id": shipment_id,
        "tracking_number": shipment.tracking_number,
        "synced_location": city,
        "traffic": traffic_data,
        "updated_risk_score": new_risk,
        "updated_sla_probability": sla_prob,
        "updated_estimated_delay": est_delay,
        "risk_tier": get_risk_tier(new_risk),
    }
