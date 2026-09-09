from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # WEATHER, TRAFFIC, HUB_DELAY, FLIGHT, GEOPOLITICAL
    severity = Column(Integer, nullable=False)  # 1 to 10
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    shipment = relationship("Shipment", back_populates="risk_events")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0 to 10
    sla_probability = Column(Float, nullable=False)  # percentage (e.g. 87.0)
    estimated_delay = Column(Float, nullable=False)  # in hours (e.g. 6.7)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    shipment = relationship("Shipment", back_populates="risk_scores")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # Reroute, Priority Transport, etc.
    description = Column(Text, nullable=False)
    expected_risk_reduction = Column(Float, nullable=False)  # e.g. 4.1
    expected_delay_reduction = Column(Float, nullable=False)  # e.g. 4.5 hours
    priority = Column(String(20), default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM

    shipment = relationship("Shipment", back_populates="recommendations")
