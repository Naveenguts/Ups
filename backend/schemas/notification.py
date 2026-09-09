from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    shipment_id: int
    type: str  # CUSTOMER, DRIVER_DISPATCH
    message: str
    sent_at: datetime
    status: str

    class Config:
        from_attributes = True


class SendNotificationRequest(BaseModel):
    channel: Optional[str] = "ALL"  # CUSTOMER, DRIVER_DISPATCH, ALL
    custom_message: Optional[str] = None


class SendNotificationResponse(BaseModel):
    message: str
    sent_count: int
    notifications: list[NotificationResponse] = []
