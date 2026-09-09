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
    reason: str,
    new_delivery_time: str
) -> str:
    """
    Customer notification containing ONLY:
    1. Reason for Delay (why delay)
    2. New Delivery Time (updated ETA)
    """
    return (
        f"📦 UPS CUSTOMER UPDATE [#{tracking_number}]\n"
        f"• Reason for Delay: {reason}\n"
        f"• New Delivery Time: {new_delivery_time}"
    )


def generate_customer_recovery_text(
    tracking_number: str,
    reason: str,
    new_delivery_time: str
) -> str:
    """
    Customer recovery notification containing:
    1. Reason for Delay update
    2. New Delivery Time
    """
    return (
        f"📦 UPS CUSTOMER UPDATE [#{tracking_number}]\n"
        f"• Reason for Delay: Resolved via alternate corridor ({reason})\n"
        f"• New Delivery Time: {new_delivery_time}"
    )


def generate_driver_dispatch_text(
    tracking_number: str,
    new_route: str,
    reason_for_new_route: str
) -> str:
    """
    Driver notification containing ONLY:
    1. New Route
    2. Reason for New Route
    """
    return (
        f"🚚 DRIVER DISPATCH ORDER [TRUCK #{tracking_number}]\n"
        f"• New Route: {new_route}\n"
        f"• Reason for New Route: {reason_for_new_route}"
    )
