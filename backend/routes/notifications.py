from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.shipment import Shipment
from models.notification import Notification
from schemas.notification import NotificationResponse
from services.notification_service import (
    create_notification,
    generate_customer_alert_text,
    generate_driver_dispatch_text,
)

router = APIRouter(prefix="/api/shipments", tags=["Notifications"])


@router.get("/{shipment_id}/notifications", response_model=List[NotificationResponse])
async def get_shipment_notifications(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves all dispatched notifications for a shipment.
    """
    stmt = (
        select(Notification)
        .where(Notification.shipment_id == shipment_id)
        .order_by(Notification.sent_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{shipment_id}/notify")
async def send_manual_notification(shipment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Triggers immediate proactive notification to both customer and driver.
    """
    stmt = (
        select(Shipment)
        .options(
            selectinload(Shipment.risk_scores),
            selectinload(Shipment.risk_events),
        )
        .where(Shipment.id == shipment_id)
    )
    result = await db.execute(stmt)
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    scores = sorted(shipment.risk_scores, key=lambda x: x.timestamp)
    latest_score = scores[-1] if scores else None
    delay = latest_score.estimated_delay if latest_score else 2.5
    updated_eta = (shipment.expected_delivery + timedelta(hours=delay)).strftime("%I:%M %p")

    # 1. Customer Notification: strictly Reason for Delay + New Delivery Time
    cust_msg = generate_customer_alert_text(
        tracking_number=shipment.tracking_number,
        reason="Severe transit bottleneck & adverse weather along NH-48 corridor",
        new_delivery_time=f"{updated_eta} IST",
    )
    cust_notif = await create_notification(db, shipment_id, "CUSTOMER", cust_msg, "SENT")

    # 2. Driver Notification: strictly New Route + Reason for New Route
    driver_msg = generate_driver_dispatch_text(
        tracking_number=shipment.tracking_number,
        new_route="NH-75 Expressway corridor via Chittoor & Kolar bypass",
        reason_for_new_route="Avoid NH-48 severe weather corridor delay & dock congestion at primary hub",
    )
    driver_notif = await create_notification(db, shipment_id, "DRIVER_DISPATCH", driver_msg, "DISPATCHED")

    return {
        "success": True,
        "message": "Dual notifications dispatched to Customer and Fleet Driver",
        "customer_notification": {
            "id": cust_notif.id,
            "message": cust_notif.message,
            "status": cust_notif.status,
            "sent_at": cust_notif.sent_at,
        },
        "driver_notification": {
            "id": driver_notif.id,
            "message": driver_notif.message,
            "status": driver_notif.status,
            "sent_at": driver_notif.sent_at,
        },
    }
