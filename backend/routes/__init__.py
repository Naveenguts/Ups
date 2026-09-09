from routes.shipments import router as shipments_router
from routes.risk import router as risk_router
from routes.simulation import router as simulation_router
from routes.notifications import router as notifications_router

__all__ = [
    "shipments_router",
    "risk_router",
    "simulation_router",
    "notifications_router",
]
