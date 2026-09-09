from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.risk import RiskScore, RiskEvent
from schemas.shipment import ShipmentSummary, ShipmentDetail
from services.risk_engine import get_risk_tier, get_factor_breakdown

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


@router.get("", response_model=List[ShipmentSummary])
async def get_shipments(db: AsyncSession = Depends(get_db)):
    """
    Returns list of all active shipments with their latest risk status.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_scores),
        )
        .order_by(Shipment.id)
    )
    result = await db.execute(stmt)
    shipments = result.scalars().all()

    summaries = []
    for s in shipments:
        scores = sorted(s.risk_scores, key=lambda x: x.timestamp)
        latest_score = scores[-1] if scores else None
        risk_val = latest_score.risk_score if latest_score else 2.5
        sla_prob = latest_score.sla_probability if latest_score else 12.0
        delay_val = latest_score.estimated_delay if latest_score else 0.5

        summaries.append(
            ShipmentSummary(
                id=s.id,
                tracking_number=s.tracking_number,
                origin=s.origin,
                destination=s.destination,
                current_location=s.current_location,
                status=s.status,
                expected_delivery=s.expected_delivery,
                sla_deadline=s.sla_deadline,
                created_at=s.created_at,
                latest_risk_score=risk_val,
                latest_sla_probability=sla_prob,
                latest_estimated_delay=delay_val,
                risk_tier=get_risk_tier(risk_val),
            )
        )
    return summaries


@router.get("/{shipment_id}", response_model=ShipmentDetail)
async def get_shipment_detail(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns complete digital twin profile of a single shipment.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_events),
            selectinload(Shipment.risk_scores),
            selectinload(Shipment.recommendations),
            selectinload(Shipment.notifications),
        )
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    risk_val = latest_score.risk_score if latest_score else 2.5
    sla_prob = latest_score.sla_probability if latest_score else 12.0
    delay_val = latest_score.estimated_delay if latest_score else 0.5

    # Determine latest signal values from events
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

    breakdown = get_factor_breakdown(
        weather=weather_sev,
        traffic=traffic_sev,
        hub=hub_sev,
        historical=3.0,
        geopolitical=2.0,
        shipment=2.0,
    )

    return ShipmentDetail(
        id=shipment.id,
        tracking_number=shipment.tracking_number,
        origin=shipment.origin,
        destination=shipment.destination,
        current_location=shipment.current_location,
        status=shipment.status,
        expected_delivery=shipment.expected_delivery,
        sla_deadline=shipment.sla_deadline,
        created_at=shipment.created_at,
        latest_risk_score=risk_val,
        latest_sla_probability=sla_prob,
        latest_estimated_delay=delay_val,
        risk_tier=get_risk_tier(risk_val),
        factor_breakdown=breakdown,
        risk_events=sorted(shipment.risk_events, key=lambda x: x.timestamp),
        risk_scores=scores,
        recommendations=shipment.recommendations,
        notifications=sorted(shipment.notifications, key=lambda x: x.sent_at, reverse=True),
    )
