from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from models.notification import Notification


async def create_notification(
    db: AsyncSession,
    shipment_id: int,
    notification_type: str,
    message: str,
    status: str = "SENT"
) -> Notification:
    """
    Creates and records a notification in PostgreSQL.
    """
    notif = Notification(
        shipment_id=shipment_id,
        type=notification_type,
        message=message,
        sent_at=datetime.utcnow(),
        status=status,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


def generate_customer_alert_text(
    tracking_number: str,
    origin: str,
    destination: str,
    updated_eta: str,
    causes: List[str]
) -> str:
    cause_str = " and ".join(causes[:2]) if causes else "severe weather and traffic"
    return (
        f"⚠️ Delivery Update for #{tracking_number} ({origin} → {destination}): "
        f"Your shipment may arrive later than originally expected due to {cause_str.lower()}. "
        f"Updated ETA: {updated_eta}. We are actively rerouting your package to minimize delay."
    )


def generate_customer_recovery_text(
    tracking_number: str,
    recovered_eta: str,
    action_taken: str
) -> str:
    return (
        f"✅ Delivery Recovery Notice for #{tracking_number}: "
        f"Operational intervention executed ({action_taken}). "
        f"Delay minimized. Your new estimated delivery is {recovered_eta}. Thank you for choosing UPS."
    )


def generate_driver_dispatch_text(
    tracking_number: str,
    action: str,
    instruction: str,
    time_saved: float
) -> str:
    return (
        f"🚨 FLEET DISPATCH ORDER // TRUCK DISPATCH FOR #{tracking_number}: "
        f"Action: {action.upper()}. "
        f"Instructions: {instruction}. "
        f"Route deviation authorized. Estimated time reduction: {time_saved} hrs. Acknowledge on telematics terminal."
    )
