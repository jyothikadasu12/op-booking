from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.service import Service


class ServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, service_id: int) -> Service | None:
        return self.db.get(Service, service_id)

    def list_all(
        self,
        *,
        active_only: bool = True,
        search: str | None = None,
    ) -> list[Service]:
        query = self.db.query(Service)
        if active_only:
            query = query.filter(Service.is_active.is_(True))
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(Service.name.ilike(term), Service.description.ilike(term))
            )
        return query.order_by(Service.id.asc()).all()

    def create(self, **fields) -> Service:
        service = Service(**fields)
        self.db.add(service)
        self.db.flush()
        return service

    def update(self, service: Service, **fields) -> Service:
        for key, value in fields.items():
            setattr(service, key, value)
        self.db.flush()
        return service
