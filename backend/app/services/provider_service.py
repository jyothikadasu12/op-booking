from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.provider_repository import ProviderRepository


class ProviderService:
    def __init__(self, db: Session):
        self.db = db
        self.providers = ProviderRepository(db)

    def list_providers(self, active_only: bool = True, search: str | None = None):
        return self.providers.list_all(active_only=active_only, search=search)

    def get_provider(self, provider_id: int):
        provider = self.providers.get_by_id(provider_id)
        if provider is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
        return provider

    def create_provider(self, **fields):
        provider = self.providers.create(**fields)
        self.db.commit()
        self.db.refresh(provider)
        return provider

    def update_provider(self, provider_id: int, **fields):
        provider = self.get_provider(provider_id)
        provider = self.providers.update(provider, **fields)
        self.db.commit()
        self.db.refresh(provider)
        return provider

    def update_status(self, provider_id: int, is_active: bool):
        return self.update_provider(provider_id, is_active=is_active)
