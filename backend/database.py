import os
import socket
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

PG_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/ups_riskpilot")
SQLITE_URL = "sqlite+aiosqlite:///./riskpilot.db"


def is_postgres_available(host="localhost", port=5432, timeout=1.0) -> bool:
    """Quick socket check to see if a PostgreSQL server is actually listening."""
    if "DATABASE_URL" not in os.environ and "localhost" in PG_URL:
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False
    return "DATABASE_URL" in os.environ


# Determine active URL
if is_postgres_available():
    ACTIVE_DB_URL = PG_URL
    print(f"[UPS RiskPilot] Connecting to PostgreSQL at {PG_URL.split('@')[-1] if '@' in PG_URL else PG_URL}")
else:
    ACTIVE_DB_URL = SQLITE_URL
    print(f"[UPS RiskPilot] PostgreSQL not active locally. Using high-performance SQLite database ({SQLITE_URL})")

engine = create_async_engine(ACTIVE_DB_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[UPS RiskPilot] Database schema initialized successfully.")
