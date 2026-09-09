from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    current_location = Column(String(100), nullable=False)
    status = Column(String(50), default="IN_TRANSIT", nullable=False)
    expected_delivery = Column(DateTime, nullable=False)
    sla_deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    risk_events = relationship("RiskEvent", back_populates="shipment", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="shipment", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="shipment", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="shipment", cascade="all, delete-orphan")
