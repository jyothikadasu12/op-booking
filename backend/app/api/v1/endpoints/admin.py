from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingResponse,
    BookingStatusUpdate,
)
from app.services.booking_service import BookingService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/bookings", response_model=list[BookingResponse])
def admin_list_bookings(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    status: str | None = Query(default=None),
    user_id: int | None = Query(default=None, gt=0),
    service_id: int | None = Query(default=None, gt=0),
    provider_id: int | None = Query(default=None, gt=0),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    service = BookingService(db)
    return service.admin_list_bookings(
        status=status,
        user_id=user_id,
        service_id=service_id,
        provider_id=provider_id,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )


@router.patch("/bookings/{booking_id}/status", response_model=BookingResponse)
def admin_update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = BookingService(db)
    return service.admin_update_status(
        current_user,
        booking_id,
        payload.status,
        payload.reason,
    )
