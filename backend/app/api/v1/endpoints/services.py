from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceStatusUpdate,
    ServiceUpdate,
)
from app.services.service_service import ServiceService


router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=list[ServiceResponse])
def list_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = Query(default=True),
    search: str | None = Query(default=None),
):
    service = ServiceService(db)
    if current_user.role != "admin":
        active_only = True
    return service.list_services(active_only=active_only, search=search)


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ServiceService(db)
    return service.get_service(service_id)


@router.post("", response_model=ServiceResponse, status_code=201)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ServiceService(db)
    return service.create_service(**payload.model_dump())


@router.patch("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ServiceService(db)
    fields = payload.model_dump(exclude_unset=True)
    return service.update_service(service_id, **fields)


@router.patch("/{service_id}/status", response_model=ServiceResponse)
def update_service_status(
    service_id: int,
    payload: ServiceStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ServiceService(db)
    return service.update_status(service_id, payload.is_active)
