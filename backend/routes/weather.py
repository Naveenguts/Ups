from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.risk import RiskEvent, RiskScore
from services.weather_service import fetch_live_corridor_weather
from services.risk_engine import (
    calculate_risk_score,
    calculate_sla_breach_probability,
    calculate_estimated_delay,
    get_risk_tier,
)

router = APIRouter(prefix="/api/weather", tags=["Real-Time Weather"])


@router.get("/live")
async def get_corridor_weather(city: str = Query("Vellore", description="Transit corridor checkpoint city")):
    """
    Returns real-time meteorological conditions for the specified logistics checkpoint
    using OpenWeatherMap live satellite feeds.
    """
    return fetch_live_corridor_weather(city)


@router.post("/sync/{shipment_id}")
async def sync_shipment_weather(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Syncs live real-time OpenWeatherMap radar conditions for the shipment's current transit location,
    dynamically recalculating the risk score from live weather data.
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

    # Determine city from current location
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

    weather_data = fetch_live_corridor_weather(city)
    severity = weather_data.get("severity", 2.0)
    summary = weather_data.get("summary", f"Live weather radar synced for {city}")

    # Add new risk event
    risk_event = RiskEvent(
        shipment_id=shipment_id,
        event_type="WEATHER",
        severity=severity,
        description=f"[OpenWeatherMap Real-Time] {summary}",
        timestamp=datetime.utcnow(),
    )
    db.add(risk_event)

    # Recalculate risk
    severities = {"WEATHER": severity, "TRAFFIC": 2.0, "HUB_DELAY": 1.0}
    for e in shipment.risk_events:
        if e.event_type in ("TRAFFIC", "HUB_DELAY", "PORT_DELAY"):
            severities[e.event_type] = float(e.severity)

    new_risk = calculate_risk_score(
        weather=severities["WEATHER"],
        traffic=severities.get("TRAFFIC", 2.0),
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
        "weather": weather_data,
        "updated_risk_score": new_risk,
        "updated_sla_probability": sla_prob,
        "updated_estimated_delay": est_delay,
        "risk_tier": get_risk_tier(new_risk),
    }
