from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.provider import Provider


class ProviderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, provider_id: int) -> Provider | None:
        return self.db.get(Provider, provider_id)

    def list_all(
        self,
        *,
        active_only: bool = True,
        search: str | None = None,
    ) -> list[Provider]:
        query = self.db.query(Provider)
        if active_only:
            query = query.filter(Provider.is_active.is_(True))
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(Provider.full_name.ilike(term), Provider.specialization.ilike(term))
            )
        return query.order_by(Provider.id.asc()).all()

    def create(self, **fields) -> Provider:
        provider = Provider(**fields)
        self.db.add(provider)
        self.db.flush()
        return provider

    def update(self, provider: Provider, **fields) -> Provider:
        for key, value in fields.items():
            setattr(provider, key, value)
        self.db.flush()
        return provider
