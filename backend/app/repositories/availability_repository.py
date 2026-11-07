from datetime import date, datetime, time, timezone

from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking


class AvailabilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, slot_id: int) -> AvailabilitySlot | None:
        return self.db.get(AvailabilitySlot, slot_id)

    def list_all(
        self,
        *,
        service_id: int | None = None,
        provider_id: int | None = None,
        on_date: date | None = None,
        include_inactive: bool = False,
    ) -> list[AvailabilitySlot]:
        query = self.db.query(AvailabilitySlot)
        if not include_inactive:
            query = query.filter(AvailabilitySlot.is_active.is_(True))
        if service_id is not None:
            query = query.filter(AvailabilitySlot.service_id == service_id)
        if provider_id is not None:
            query = query.filter(AvailabilitySlot.provider_id == provider_id)
        if on_date is not None:
            start = datetime.combine(on_date, time.min).replace(tzinfo=timezone.utc)
            end = datetime.combine(on_date, time.max).replace(tzinfo=timezone.utc)
            query = query.filter(
                AvailabilitySlot.start_time >= start,
                AvailabilitySlot.start_time <= end,
            )
        return query.order_by(AvailabilitySlot.start_time.asc()).all()

    def find_overlapping(
        self,
        provider_id: int,
        start_time: datetime,
        end_time: datetime,
        exclude_slot_id: int | None = None,
    ) -> list[AvailabilitySlot]:
        query = self.db.query(AvailabilitySlot).filter(
            AvailabilitySlot.provider_id == provider_id,
            AvailabilitySlot.is_active.is_(True),
            AvailabilitySlot.start_time < end_time,
            AvailabilitySlot.end_time > start_time,
        )
        if exclude_slot_id is not None:
            query = query.filter(AvailabilitySlot.id != exclude_slot_id)
        return query.all()

    def active_booking_count(self, slot_id: int) -> int:
        return (
            self.db.query(Booking)
            .filter(
                Booking.slot_id == slot_id,
                Booking.status.in_(("pending", "confirmed")),
            )
            .count()
        )

    def create(self, **fields) -> AvailabilitySlot:
        slot = AvailabilitySlot(**fields)
        self.db.add(slot)
        self.db.flush()
        return slot

    def update(self, slot: AvailabilitySlot, **fields) -> AvailabilitySlot:
        for key, value in fields.items():
            setattr(slot, key, value)
        self.db.flush()
        return slot
