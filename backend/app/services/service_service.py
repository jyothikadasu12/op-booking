from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.service_repository import ServiceRepository


class ServiceService:
    def __init__(self, db: Session):
        self.db = db
        self.services = ServiceRepository(db)

    def list_services(self, active_only: bool = True, search: str | None = None):
        return self.services.list_all(active_only=active_only, search=search)

    def get_service(self, service_id: int):
        service = self.services.get_by_id(service_id)
        if service is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
        return service

    def create_service(self, **fields):
        service = self.services.create(**fields)
        self.db.commit()
        self.db.refresh(service)
        return service

    def update_service(self, service_id: int, **fields):
        service = self.get_service(service_id)
        service = self.services.update(service, **fields)
        self.db.commit()
        self.db.refresh(service)
        return service

    def update_status(self, service_id: int, is_active: bool):
        return self.update_service(service_id, is_active=is_active)
