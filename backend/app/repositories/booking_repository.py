from datetime import datetime

from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking
from app.models.booking_history import BookingHistory


class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self.db.get(Booking, booking_id)

    def get_slot_with_lock(self, slot_id: int):
        from app.models.availability_slot import AvailabilitySlot

        return (
            self.db.query(AvailabilitySlot)
            .filter(AvailabilitySlot.id == slot_id)
            .with_for_update()
            .first()
        )

    def count_active_for_slot(self, slot_id: int) -> int:
        return (
            self.db.query(Booking)
            .filter(
                Booking.slot_id == slot_id,
                Booking.status.in_(("pending", "confirmed")),
            )
            .count()
        )

    def user_has_active_booking_for_slot(self, user_id: int, slot_id: int) -> bool:
        return (
            self.db.query(Booking)
            .filter(
                Booking.user_id == user_id,
                Booking.slot_id == slot_id,
                Booking.status.in_(("pending", "confirmed")),
            )
            .first()
            is not None
        )

    def create(self, **fields) -> Booking:
        booking = Booking(**fields)
        self.db.add(booking)
        self.db.flush()
        return booking

    def update(self, booking: Booking, **fields) -> Booking:
        for key, value in fields.items():
            setattr(booking, key, value)
        self.db.flush()
        return booking

    def list_for_user(
        self,
        user_id: int,
        *,
        status: str | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Booking]:
        query = self.db.query(Booking).filter(Booking.user_id == user_id)
        if status:
            query = query.filter(Booking.status == status)
        if from_date is not None or to_date is not None:
            query = query.join(AvailabilitySlot, Booking.slot_id == AvailabilitySlot.id)
            if from_date is not None:
                query = query.filter(AvailabilitySlot.start_time >= from_date)
            if to_date is not None:
                query = query.filter(AvailabilitySlot.start_time <= to_date)
        return (
            query.order_by(Booking.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

    def list_all(
        self,
        *,
        status: str | None = None,
        user_id: int | None = None,
        service_id: int | None = None,
        provider_id: int | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> list[Booking]:
        query = self.db.query(Booking)
        needs_slot_join = any(
            value is not None
            for value in (service_id, provider_id, from_date, to_date)
        )
        if needs_slot_join:
            query = query.join(AvailabilitySlot, Booking.slot_id == AvailabilitySlot.id)
        if status:
            query = query.filter(Booking.status == status)
        if user_id is not None:
            query = query.filter(Booking.user_id == user_id)
        if service_id is not None:
            query = query.filter(AvailabilitySlot.service_id == service_id)
        if provider_id is not None:
            query = query.filter(AvailabilitySlot.provider_id == provider_id)
        if from_date is not None:
            query = query.filter(AvailabilitySlot.start_time >= from_date)
        if to_date is not None:
            query = query.filter(AvailabilitySlot.start_time <= to_date)
        return (
            query.order_by(Booking.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

    def add_history(self, **fields) -> BookingHistory:
        history = BookingHistory(**fields)
        self.db.add(history)
        self.db.flush()
        return history

    def get_history(self, booking_id: int) -> list[BookingHistory]:
        return (
            self.db.query(BookingHistory)
            .filter(BookingHistory.booking_id == booking_id)
            .order_by(BookingHistory.changed_at.asc())
            .all()
        )
