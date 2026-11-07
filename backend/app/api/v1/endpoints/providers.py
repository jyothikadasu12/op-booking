from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.provider import (
    ProviderCreate,
    ProviderResponse,
    ProviderStatusUpdate,
    ProviderUpdate,
)
from app.services.provider_service import ProviderService

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=list[ProviderResponse])
def list_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = Query(default=True),
    search: str | None = Query(default=None),
):
    service = ProviderService(db)
    if current_user.role != "admin":
        active_only = True
    return service.list_providers(active_only=active_only, search=search)


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ProviderService(db)
    return service.get_provider(provider_id)


@router.post("", response_model=ProviderResponse, status_code=201)
def create_provider(
    payload: ProviderCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ProviderService(db)
    return service.create_provider(**payload.model_dump())


@router.patch("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: int,
    payload: ProviderUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ProviderService(db)
    fields = payload.model_dump(exclude_unset=True)
    return service.update_provider(provider_id, **fields)


@router.patch("/{provider_id}/status", response_model=ProviderResponse)
def update_provider_status(
    provider_id: int,
    payload: ProviderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    service = ProviderService(db)
    return service.update_status(provider_id, payload.is_active)
