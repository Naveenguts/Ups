from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.shipment import Shipment
from models.risk import RiskScore, RiskEvent, Recommendation
from models.notification import Notification
from services.notification_service import (
    generate_customer_alert_text,
    generate_driver_dispatch_text,
)


async def seed_database(db: AsyncSession):
    """
    Seeds initial shipments, risk history, and events into PostgreSQL/SQLite.
    """
    stmt = select(Shipment)
    res = await db.execute(stmt)
    existing = res.scalars().first()
    if existing:
        return  # Database already seeded

    now = datetime.utcnow()

    # 1. Flagship demo shipment: UPS10245 (Chennai -> Bangalore via Vellore)
    shipment_1 = Shipment(
        tracking_number="UPS10245",
        origin="Chennai",
        destination="Bangalore",
        current_location="Vellore Transit Hub",
        status="IN_TRANSIT",
        expected_delivery=now.replace(hour=18, minute=30, second=0, microsecond=0),
        sla_deadline=now.replace(hour=20, minute=0, second=0, microsecond=0),
        created_at=now - timedelta(hours=6),
    )
    db.add(shipment_1)
    await db.flush()

    # Baseline healthy risk score
    score_1 = RiskScore(
        shipment_id=shipment_1.id,
        risk_score=2.8,
        sla_probability=12.0,
        estimated_delay=0.6,
        timestamp=now - timedelta(hours=3),
    )
    db.add(score_1)

    event_1 = RiskEvent(
        shipment_id=shipment_1.id,
        event_type="WEATHER",
        severity=2,
        description="Clear skies and mild wind along NH-48 corridor",
        timestamp=now - timedelta(hours=3),
    )
    db.add(event_1)

    # 2. Shipment UPS10251: Mumbai -> Delhi (High Risk)
    shipment_2 = Shipment(
        tracking_number="UPS10251",
        origin="Mumbai",
        destination="Delhi",
        current_location="Surat Hub",
        status="DELAYED",
        expected_delivery=now + timedelta(hours=8),
        sla_deadline=now + timedelta(hours=9, minutes=30),
        created_at=now - timedelta(hours=10),
    )
    db.add(shipment_2)
    await db.flush()

    score_2 = RiskScore(
        shipment_id=shipment_2.id,
        risk_score=7.3,
        sla_probability=68.0,
        estimated_delay=5.8,
        timestamp=now - timedelta(hours=1),
    )
    db.add(score_2)

    event_2 = RiskEvent(
        shipment_id=shipment_2.id,
        event_type="TRAFFIC",
        severity=8,
        description="Major highway maintenance bottleneck near Vadodara bypass",
        timestamp=now - timedelta(hours=1),
    )
    db.add(event_2)

    notif_cust_2 = Notification(
        shipment_id=shipment_2.id,
        type="CUSTOMER",
        message=generate_customer_alert_text(
            tracking_number=shipment_2.tracking_number,
            reason="Severe highway roadwork bottleneck near Vadodara bypass",
            new_delivery_time=(now + timedelta(hours=8, minutes=45)).strftime("%I:%M %p IST"),
        ),
        sent_at=now - timedelta(minutes=45),
        status="SENT",
    )
    db.add(notif_cust_2)

    notif_driver_2 = Notification(
        shipment_id=shipment_2.id,
        type="DRIVER_DISPATCH",
        message=generate_driver_dispatch_text(
            tracking_number=shipment_2.tracking_number,
            new_route="State Highway 64 Bypass via Bharuch East Corridor",
            reason_for_new_route="Avoid 4.5 hour Vadodara maintenance bottleneck on primary highway",
        ),
        sent_at=now - timedelta(minutes=30),
        status="DISPATCHED",
    )
    db.add(notif_driver_2)

    # 3. Shipment UPS10267: Delhi -> Pune (High Risk)
    shipment_3 = Shipment(
        tracking_number="UPS10267",
        origin="Delhi",
        destination="Pune",
        current_location="Jaipur Corridor",
        status="IN_TRANSIT",
        expected_delivery=now + timedelta(hours=12),
        sla_deadline=now + timedelta(hours=14),
        created_at=now - timedelta(hours=8),
    )
    db.add(shipment_3)
    await db.flush()

    score_3 = RiskScore(
        shipment_id=shipment_3.id,
        risk_score=6.8,
        sla_probability=62.0,
        estimated_delay=5.4,
        timestamp=now - timedelta(hours=2),
    )
    db.add(score_3)

    # 4. Shipment UPS10289: Hyderabad -> Chennai (Medium Risk)
    shipment_4 = Shipment(
        tracking_number="UPS10289",
        origin="Hyderabad",
        destination="Chennai",
        current_location="Ongole Transit",
        status="IN_TRANSIT",
        expected_delivery=now + timedelta(hours=5),
        sla_deadline=now + timedelta(hours=6, minutes=30),
        created_at=now - timedelta(hours=5),
    )
    db.add(shipment_4)
    await db.flush()

    score_4 = RiskScore(
        shipment_id=shipment_4.id,
        risk_score=4.2,
        sla_probability=26.0,
        estimated_delay=3.3,
        timestamp=now - timedelta(hours=1),
    )
    db.add(score_4)

    # 5. Shipment UPS10312: Kolkata -> Patna (Low Risk)
    shipment_5 = Shipment(
        tracking_number="UPS10312",
        origin="Kolkata",
        destination="Patna",
        current_location="Asansol Crossing",
        status="IN_TRANSIT",
        expected_delivery=now + timedelta(hours=15),
        sla_deadline=now + timedelta(hours=17),
        created_at=now - timedelta(hours=4),
    )
    db.add(shipment_5)
    await db.flush()

    score_5 = RiskScore(
        shipment_id=shipment_5.id,
        risk_score=1.8,
        sla_probability=8.0,
        estimated_delay=1.4,
        timestamp=now - timedelta(hours=2),
    )
    db.add(score_5)

    # 6. Shipment UPS10344: Bangalore -> Kochi (Low Risk)
    shipment_6 = Shipment(
        tracking_number="UPS10344",
        origin="Bangalore",
        destination="Kochi",
        current_location="Coimbatore Hub",
        status="IN_TRANSIT",
        expected_delivery=now + timedelta(hours=7),
        sla_deadline=now + timedelta(hours=8, minutes=30),
        created_at=now - timedelta(hours=3),
    )
    db.add(shipment_6)
    await db.flush()

    score_6 = RiskScore(
        shipment_id=shipment_6.id,
        risk_score=2.1,
        sla_probability=10.0,
        estimated_delay=1.6,
        timestamp=now - timedelta(hours=1),
    )
    db.add(score_6)

    await db.commit()
