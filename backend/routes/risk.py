from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.risk import RiskScore, RiskEvent
from schemas.shipment import RiskScoreResponse
from services.risk_engine import (
    calculate_risk_score,
    calculate_sla_breach_probability,
    calculate_estimated_delay,
    get_risk_tier,
)

router = APIRouter(prefix="/api/shipments", tags=["Risk"])


@router.get("/{shipment_id}/risk-history", response_model=List[RiskScoreResponse])
async def get_risk_history(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns historical risk scores for Recharts visualization.
    """
    stmt = (
        select(RiskScore)
        .where(RiskScore.shipment_id == shipment_id)
        .order_by(RiskScore.timestamp)
    )
    result = await db.execute(stmt)
    scores = result.scalars().all()
    return scores


@router.post("/{shipment_id}/calculate-risk", response_model=RiskScoreResponse)
async def recalculate_risk(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Recalculates risk score from currently recorded events and saves a new history point.
    """
    stmt = (
        select(Shipment)
        .options(selectinload(Shipment.risk_events))
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    weather_sev = 2.0
    traffic_sev = 2.0
    hub_sev = 1.0
    for e in shipment.risk_events:
        if e.event_type == "WEATHER":
            weather_sev = float(e.severity)
        elif e.event_type == "TRAFFIC":
            traffic_sev = float(e.severity)
        elif e.event_type in ("HUB_DELAY", "PORT_DELAY"):
            hub_sev = float(e.severity)

    new_score = calculate_risk_score(weather=weather_sev, traffic=traffic_sev, hub=hub_sev)
    sla_prob = calculate_sla_breach_probability(new_score)
    est_delay = calculate_estimated_delay(new_score)

    risk_entry = RiskScore(
        shipment_id=shipment_id,
        risk_score=new_score,
        sla_probability=sla_prob,
        estimated_delay=est_delay,
        timestamp=datetime.utcnow(),
    )
    db.add(risk_entry)
    await db.commit()
    await db.refresh(risk_entry)

    return risk_entry
