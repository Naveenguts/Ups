from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.risk import RiskEvent, RiskScore, Recommendation
from models.notification import Notification
from schemas.risk import (
    SimulateEventRequest,
    WhatIfRequest,
    WhatIfResponse,
    AIRecommendationResponse,
    ApplyActionRequest,
)
from services.risk_engine import (
    calculate_risk_score,
    calculate_sla_breach_probability,
    calculate_estimated_delay,
    get_risk_tier,
)
from services.ai_service import generate_ai_decision
from services.notification_service import (
    create_notification,
    generate_customer_alert_text,
    generate_customer_recovery_text,
    generate_driver_dispatch_text,
)

router = APIRouter(prefix="/api/shipments", tags=["Simulation & AI"])


@router.post("/{shipment_id}/simulate")
async def simulate_event(
    shipment_id: int,
    request: SimulateEventRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates an external event (WEATHER, TRAFFIC, HUB_DELAY) with given severity (1-10).
    Dynamically recalculates risk, creates audit log, and triggers proactive customer alerts when SLA breach > 70%.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_events),
            selectinload(Shipment.risk_scores),
            selectinload(Shipment.notifications),
        )
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Generate descriptive text if not provided
    event_type = request.event_type.upper()
    severity = request.severity
    desc = request.description
    if not desc:
        if event_type == "WEATHER":
            desc = f"Heavy rainfall detected along corridor (Severity: {severity}/10)" if severity >= 7 else f"Passing rain showers detected (Severity: {severity}/10)"
        elif event_type == "TRAFFIC":
            desc = f"Severe traffic gridlock near transit bottleneck (Severity: {severity}/10)" if severity >= 7 else f"Moderate highway traffic slowdown (Severity: {severity}/10)"
        elif event_type in ("HUB_DELAY", "PORT_DELAY"):
            desc = f"Distribution hub terminal delay and dock backlog (Severity: {severity}/10)" if severity >= 7 else f"Minor sorting facility processing queue (Severity: {severity}/10)"
        else:
            desc = f"{event_type} signal disruption updated (Severity: {severity}/10)"

    # Add new risk event
    risk_event = RiskEvent(
        shipment_id=shipment_id,
        event_type=event_type,
        severity=severity,
        description=desc,
        timestamp=datetime.utcnow(),
    )
    db.add(risk_event)

    # Gather all current severities
    severities = {"WEATHER": 2.0, "TRAFFIC": 2.0, "HUB_DELAY": 1.0}
    for e in shipment.risk_events:
        if e.event_type in severities:
            severities[e.event_type] = float(e.severity)
    # Apply latest
    if event_type in severities:
        severities[event_type] = float(severity)

    new_risk = calculate_risk_score(
        weather=severities["WEATHER"],
        traffic=severities["TRAFFIC"],
        hub=severities["HUB_DELAY"],
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

    # If SLA breach probability > 70%, trigger automated proactive customer notification
    auto_notified = False
    if sla_prob > 70.0:
        updated_eta_str = (shipment.expected_delivery + timedelta(hours=est_delay)).strftime("%I:%M %p")
        msg = generate_customer_alert_text(
            tracking_number=shipment.tracking_number,
            origin=shipment.origin,
            destination=shipment.destination,
            updated_eta=updated_eta_str,
            causes=[desc],
        )
        # Check if already sent recently to avoid duplicate alerts
        has_recent = any("Delivery Update" in n.message for n in shipment.notifications)
        if not has_recent:
            await create_notification(db, shipment_id, "CUSTOMER", msg, "SENT")
            auto_notified = True

    await db.commit()

    return {
        "success": True,
        "event_added": {
            "type": event_type,
            "severity": severity,
            "description": desc,
        },
        "updated_risk_score": new_risk,
        "risk_tier": get_risk_tier(new_risk),
        "sla_breach_probability": sla_prob,
        "estimated_delay_hours": est_delay,
        "auto_customer_notified": auto_notified,
    }


@router.post("/{shipment_id}/recommend", response_model=AIRecommendationResponse)
async def get_ai_recommendation(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Calls AI engine to explain why the shipment is at risk, predict SLA impact,
    and generate top prescriptive recommendations.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_events),
            selectinload(Shipment.risk_scores),
        )
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    current_risk = latest_score.risk_score if latest_score else 2.8
    sla_prob = latest_score.sla_probability if latest_score else 12.0
    est_delay = latest_score.estimated_delay if latest_score else 0.5

    severities = {"WEATHER": 2.0, "TRAFFIC": 2.0, "HUB_DELAY": 1.0}
    for e in shipment.risk_events:
        if e.event_type in severities:
            severities[e.event_type] = float(e.severity)

    shipment_payload = {
        "tracking_number": shipment.tracking_number,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "risk_score": current_risk,
        "weather": severities["WEATHER"],
        "traffic": severities["TRAFFIC"],
        "hub_delay": severities["HUB_DELAY"],
        "sla_breach_probability": sla_prob,
        "estimated_delay_hours": est_delay,
    }

    ai_result = await generate_ai_decision(shipment_payload)

    # Save recommendations to database for reference
    # Clear old recommendations for this shipment
    await db.execute(delete(Recommendation).where(Recommendation.shipment_id == shipment_id))
    for rec in ai_result["recommendations"]:
        rec_entry = Recommendation(
            shipment_id=shipment_id,
            action=rec["action"],
            description=rec["description"],
            expected_risk_reduction=rec["expected_risk_reduction"],
            expected_delay_reduction=rec["expected_delay_reduction"],
            priority=rec["priority"],
        )
        db.add(rec_entry)
    await db.commit()

    return ai_result


@router.post("/{shipment_id}/what-if", response_model=WhatIfResponse)
async def what_if_simulator(
    shipment_id: int,
    request: WhatIfRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Computes before vs after risk and SLA breach metrics for simulated signal adjustments and actions.
    """
    before_risk = calculate_risk_score(
        weather=request.weather,
        traffic=request.traffic,
        hub=request.hub_delay,
        historical=request.historical,
        geopolitical=request.geopolitical,
        shipment=request.shipment_factor,
    )
    before_delay = calculate_estimated_delay(before_risk)
    before_sla_prob = calculate_sla_breach_probability(before_risk)

    action = request.action or "Reroute through Bangalore Hub B"
    risk_reduction = 4.1
    delay_reduction = 4.5

    if "Priority" in action:
        risk_reduction = 2.5
        delay_reduction = 2.4
    elif "Alternate Hub" in action:
        risk_reduction = 3.5
        delay_reduction = 3.8

    after_risk = round(max(1.0, before_risk - risk_reduction), 1)
    after_delay = round(max(0.3, before_delay - delay_reduction), 1)
    after_sla_prob = calculate_sla_breach_probability(after_risk)

    return WhatIfResponse(
        before_risk=before_risk,
        before_delay=before_delay,
        before_sla_prob=before_sla_prob,
        after_risk=after_risk,
        after_delay=after_delay,
        after_sla_prob=after_sla_prob,
        action=action,
        time_saved=round(before_delay - after_delay, 1),
        sla_recovery=round(before_sla_prob - after_sla_prob, 1),
    )


@router.post("/{shipment_id}/apply-action")
async def apply_operational_action(
    shipment_id: int,
    request: ApplyActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Applies prescriptive intervention (e.g. Reroute through Hub B):
    1. Updates shipment status to REROUTED
    2. Drops risk score from High/Critical to Low/Medium
    3. Records new risk history point
    4. Automatically dispatches Customer Recovery Notification & Driver Dispatch Order!
    """
    stmt = (
        select(Shipment)
        .options(selectinload(Shipment.risk_scores))
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = "REROUTED"
    shipment.current_location = "NH-75 Alternate Corridor"

    # Reduce risk score
    reduced_risk = 4.2
    reduced_delay = 2.1
    reduced_sla_prob = 21.0

    risk_score = RiskScore(
        shipment_id=shipment_id,
        risk_score=reduced_risk,
        sla_probability=reduced_sla_prob,
        estimated_delay=reduced_delay,
        timestamp=datetime.utcnow(),
    )
    db.add(risk_score)

    # 1. Dispatch Customer Recovery Notice
    recovered_eta_str = (shipment.expected_delivery + timedelta(hours=reduced_delay)).strftime("%I:%M %p")
    cust_msg = generate_customer_recovery_text(
        tracking_number=shipment.tracking_number,
        recovered_eta=recovered_eta_str,
        action_taken=request.action,
    )
    await create_notification(db, shipment_id, "CUSTOMER", cust_msg, "SENT")

    # 2. Dispatch Driver Fleet Route Change Order
    driver_msg = generate_driver_dispatch_text(
        tracking_number=shipment.tracking_number,
        action=request.action,
        instruction=request.description or "Divert from Vellore via NH-75 directly to Bangalore Hub B. Follow onboard GPS vector.",
        time_saved=request.expected_delay_reduction or 4.5,
    )
    await create_notification(db, shipment_id, "DRIVER_DISPATCH", driver_msg, "DISPATCHED")

    await db.commit()

    return {
        "success": True,
        "message": f"Action '{request.action}' successfully applied to #{shipment.tracking_number}",
        "new_status": shipment.status,
        "new_location": shipment.current_location,
        "recovered_risk_score": reduced_risk,
        "recovered_sla_probability": reduced_sla_prob,
        "recovered_delay_hours": reduced_delay,
        "customer_recovered_eta": recovered_eta_str,
        "notifications_dispatched": ["CUSTOMER", "DRIVER_DISPATCH"],
    }


@router.post("/demo/reset")
async def reset_demo_state(db: AsyncSession = Depends(get_db)):
    """
    Resets the flagship shipment (#UPS10245) to initial Step 1 state (Normal 🟢)
    for seamless presentation rehearsing.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_events),
            selectinload(Shipment.risk_scores),
            selectinload(Shipment.recommendations),
            selectinload(Shipment.notifications),
        )
        .where(Shipment.tracking_number == "UPS10245")
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment UPS10245 not found")

    # Clear events, recommendations, and notifications
    await db.execute(delete(RiskEvent).where(RiskEvent.shipment_id == shipment.id))
    await db.execute(delete(RiskScore).where(RiskScore.shipment_id == shipment.id))
    await db.execute(delete(Recommendation).where(Recommendation.shipment_id == shipment.id))
    await db.execute(delete(Notification).where(Notification.shipment_id == shipment.id))

    # Reset shipment state
    shipment.status = "IN_TRANSIT"
    shipment.current_location = "Vellore Transit Hub"

    # Insert initial baseline score: Risk = 2.8 🟢, SLA = 12%
    base_score = RiskScore(
        shipment_id=shipment.id,
        risk_score=2.8,
        sla_probability=12.0,
        estimated_delay=0.6,
        timestamp=datetime.utcnow() - timedelta(hours=3),
    )
    db.add(base_score)

    await db.commit()
    return {"success": True, "message": "Demo shipment #UPS10245 reset to initial Step 1 state (Healthy 🟢)."}
