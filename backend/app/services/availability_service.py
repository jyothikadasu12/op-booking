from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.availability_repository import AvailabilityRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository


class AvailabilityService:
    def __init__(self, db: Session):
        self.db = db
        self.availability = AvailabilityRepository(db)
        self.services = ServiceRepository(db)
        self.providers = ProviderRepository(db)

    def list_slots(
        self,
        service_id: int | None = None,
        provider_id: int | None = None,
        on_date=None,
        include_inactive: bool = False,
    ):
        return self.availability.list_all(
            service_id=service_id,
            provider_id=provider_id,
            on_date=on_date,
            include_inactive=include_inactive,
        )

    def get_slot(self, slot_id: int):
        slot = self.availability.get_by_id(slot_id)
        if slot is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found"
            )
        return slot

    def _require_active_service(self, service_id: int):
        service = self.services.get_by_id(service_id)
        if service is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Service not found"
            )
        if not service.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service is inactive",
            )
        return service

    def _require_active_provider(self, provider_id: int):
        provider = self.providers.get_by_id(provider_id)
        if provider is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found"
            )
        if not provider.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provider is inactive",
            )
        return provider

    def _ensure_future(self, value: datetime, field_name: str):
        if value < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} cannot be in the past",
            )

    def _ensure_no_overlap(
        self,
        provider_id: int,
        start_time: datetime,
        end_time: datetime,
        exclude_slot_id: int | None = None,
    ):
        overlapping = self.availability.find_overlapping(
            provider_id, start_time, end_time, exclude_slot_id=exclude_slot_id
        )
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Provider already has a conflicting slot",
            )

    def create_slot(
        self,
        service_id: int,
        provider_id: int,
        start_time: datetime,
        end_time: datetime,
        capacity: int,
        is_active: bool = True,
    ):
        self._require_active_service(service_id)
        self._require_active_provider(provider_id)
        if end_time <= start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_time must be after start_time",
            )
        if capacity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Capacity must be positive",
            )
        self._ensure_future(start_time, "start_time")
        self._ensure_no_overlap(provider_id, start_time, end_time)

        slot = self.availability.create(
            service_id=service_id,
            provider_id=provider_id,
            start_time=start_time,
            end_time=end_time,
            capacity=capacity,
            is_active=is_active,
        )
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def update_slot(self, slot_id: int, **fields):
        slot = self.get_slot(slot_id)
        active_booking_count = self.availability.active_booking_count(slot.id)

        # Determine the proposed values without mutating the slot yet.
        proposed = {
            "service_id": fields.get("service_id", slot.service_id),
            "provider_id": fields.get("provider_id", slot.provider_id),
            "start_time": fields.get("start_time", slot.start_time),
            "end_time": fields.get("end_time", slot.end_time),
            "capacity": fields.get("capacity", slot.capacity),
            "is_active": fields.get("is_active", slot.is_active),
        }

        if proposed["end_time"] <= proposed["start_time"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_time must be after start_time",
            )
        if proposed["capacity"] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Capacity must be positive",
            )

        # Blocks changes that could invalidate existing bookings.
        mutates_schedule = (
            proposed["service_id"] != slot.service_id
            or proposed["provider_id"] != slot.provider_id
            or proposed["start_time"] != slot.start_time
            or proposed["end_time"] != slot.end_time
        )

        if active_booking_count > 0:
            if mutates_schedule:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Cannot change this slot because bookings already exist"
                    ),
                )
            if proposed["capacity"] < active_booking_count:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Capacity cannot be lower than the number of active bookings",
                )

        if fields.get("service_id") is not None:
            self._require_active_service(proposed["service_id"])
        if fields.get("provider_id") is not None:
            self._require_active_provider(proposed["provider_id"])

        # Only re-evaluate overlap when provider/time actually changes.
        if mutates_schedule:
            if proposed["provider_id"] == slot.provider_id or fields.get("provider_id") is not None:
                self._ensure_future(proposed["start_time"], "start_time")
            self._ensure_no_overlap(
                proposed["provider_id"],
                proposed["start_time"],
                proposed["end_time"],
                exclude_slot_id=slot.id,
            )

        slot = self.availability.update(slot, **fields)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def update_status(self, slot_id: int, is_active: bool):
        return self.update_slot(slot_id, is_active=is_active)
