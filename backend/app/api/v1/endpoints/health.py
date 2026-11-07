from typing import Any

from fastapi import APIRouter
from sqlalchemy import text

from app.db.session import engine

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict[str, Any]:
    """Return API health and verify PostgreSQL connectivity."""
    database_status = "connected"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - only for diagnostics
        database_status = f"error: {exc}"

    return {
        "success": True,
        "message": "Service Booking API is running",
        "data": {
            "environment": "development",
            "database": database_status,
        },
    }
