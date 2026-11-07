from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.availability import (
    AvailabilityCreate,
    AvailabilityResponse,
    AvailabilityStatusUpdate,
    AvailabilityUpdate,
)
from app.services.availability_service import AvailabilityService


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get("", response_model=list[AvailabilityResponse])
def list_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service_id: int | None = Query(default=None, gt=0),
    provider_id: int | None = Query(default=None, gt=0),
    on_date: date | None = Query(default=None),
    include_inactive: bool = Query(default=False),
):
    service = AvailabilityService(db)
    if current_user.role != "admin":
        include_inactive = False
    return service.list_slots(
        service_id=service_id,
        provider_id=provider_id,
        on_date=on_date,
        include_inactive=include_inactive,
    )


@router.get("/{slot_id}", response_model=AvailabilityResponse)
def get_availability(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AvailabilityService(db)
    return service.get_slot(slot_id)


@router.post("", response_model=AvailabilityResponse, status_code=201)
def create_availability(
    payload: AvailabilityCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = AvailabilityService(db)
    return service.create_slot(
        service_id=payload.service_id,
        provider_id=payload.provider_id,
        start_time=_normalize_datetime(payload.start_time),
        end_time=_normalize_datetime(payload.end_time),
        capacity=payload.capacity,
        is_active=payload.is_active,
    )


@router.patch("/{slot_id}", response_model=AvailabilityResponse)
def update_availability(
    slot_id: int,
    payload: AvailabilityUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = AvailabilityService(db)
    fields = payload.model_dump(exclude_unset=True)
    if "start_time" in fields and fields["start_time"] is not None:
        fields["start_time"] = _normalize_datetime(fields["start_time"])
    if "end_time" in fields and fields["end_time"] is not None:
        fields["end_time"] = _normalize_datetime(fields["end_time"])
    return service.update_slot(slot_id, **fields)


@router.patch("/{slot_id}/status", response_model=AvailabilityResponse)
def update_availability_status(
    slot_id: int,
    payload: AvailabilityStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = AvailabilityService(db)
    return service.update_status(slot_id, payload.is_active)
