from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    type = Column(String(50), default="CUSTOMER", nullable=False)  # CUSTOMER, DRIVER_DISPATCH
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="SENT", nullable=False)  # SENT, DELIVERED, PENDING

    shipment = relationship("Shipment", back_populates="notifications")
