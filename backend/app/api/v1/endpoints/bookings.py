from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCancel,
    BookingCreate,
    BookingHistoryResponse,
    BookingReschedule,
    BookingResponse,
)
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.create_booking(current_user, payload.slot_id, payload.reason)


@router.get("/my", response_model=list[BookingResponse])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    service = BookingService(db)
    return service.list_customer_bookings(
        current_user,
        status=status,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.get_booking(current_user, booking_id)


@router.get("/{booking_id}/history", response_model=list[BookingHistoryResponse])
def get_booking_history(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.get_history(current_user, booking_id)


@router.patch("/{booking_id}/reschedule", response_model=BookingResponse)
def reschedule_booking(
    booking_id: int,
    payload: BookingReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.reschedule_booking(
        current_user, booking_id, payload.new_slot_id
    )


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    payload: BookingCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = BookingService(db)
    return service.cancel_booking(current_user, booking_id, payload.reason)
