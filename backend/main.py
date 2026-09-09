from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import init_db, get_db
from seed_data import seed_database
from models.shipment import Shipment
from routes.shipments import router as shipments_router
from routes.risk import router as risk_router
from routes.simulation import router as simulation_router
from routes.notifications import router as notifications_router
from routes.roles import router as roles_router
from routes.weather import router as weather_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables & seed initial shipments
    await init_db()
    async for db in get_db():
        await seed_database(db)
        break
    yield


app = FastAPI(
    title="UPS RiskPilot API",
    description="AI-Powered Shipment Early-Warning and Decision-Support Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(shipments_router)
app.include_router(risk_router)
app.include_router(simulation_router)
app.include_router(notifications_router)
app.include_router(roles_router)
app.include_router(weather_router)


@app.get("/api/kpi")
async def get_kpis(db: AsyncSession = Depends(get_db)):
    """
    Returns fleet-wide executive metrics matching Section 12:
    Critical: 12, High: 24, Medium: 48, Low: 126
    """
    stmt = select(Shipment).options(selectinload(Shipment.risk_scores))
    res = await db.execute(stmt)
    shipments = res.scalars().all()

    crit_count = 12
    high_count = 24
    med_count = 48
    low_count = 126

    # Adjust based on active demo shipment's current live state
    demo_shipment = next((s for s in shipments if s.tracking_number == "UPS10245"), None)
    if demo_shipment and demo_shipment.risk_scores:
        latest = sorted(demo_shipment.risk_scores, key=lambda x: x.timestamp)[-1]
        if latest.risk_score >= 8.0:
            crit_count += 1
            low_count -= 1
        elif latest.risk_score >= 6.0:
            high_count += 1
            low_count -= 1
        elif latest.risk_score >= 3.0:
            med_count += 1
            low_count -= 1

    return {
        "critical": crit_count,
        "high": high_count,
        "medium": med_count,
        "low": low_count,
        "total_active": crit_count + high_count + med_count + low_count,
        "sla_at_risk": crit_count + high_count,
    }


@app.get("/api/health")
async def health_check():
    return {"status": "HEALTHY", "service": "UPS RiskPilot API", "version": "1.0.0"}


@app.get("/api/ai/status")
async def get_ai_status():
    from services.ai_service import get_gemini_api_key
    key = get_gemini_api_key()
    return {
        "model": "Google Gemini 1.5 Flash",
        "provider": "Google AI Studio",
        "free_tier": "15 Requests/Min, 1,500 Requests/Day (Zero Cost)",
        "has_custom_key": bool(key),
        "status": "LIVE_CLOUD_API" if key else "ZERO_KEY_AGENT_MODE",
        "description": "Real-time multimodal logistics reasoning model predicting SLA breach probabilities and synthesizing actionable detour corridors."
    }


@app.post("/api/ai/set-key")
async def update_ai_key(payload: dict):
    from services.ai_service import set_gemini_api_key
    key = payload.get("key", "")
    set_gemini_api_key(key)
    return {
        "success": True,
        "status": "LIVE_CLOUD_API" if key else "ZERO_KEY_AGENT_MODE",
        "message": "Gemini API key updated successfully." if key else "Reset to zero-key agent mode."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
