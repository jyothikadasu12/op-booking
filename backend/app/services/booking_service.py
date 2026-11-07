import secrets
from datetime import datetime, time, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot
from app.repositories.availability_repository import AvailabilityRepository
from app.repositories.booking_repository import BookingRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.user_repository import UserRepository

ALLOWED_STATUS_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"cancelled", "completed"},
    "cancelled": set(),
    "completed": set(),
}


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.bookings = BookingRepository(db)
        self.availability = AvailabilityRepository(db)
        self.services = ServiceRepository(db)
        self.providers = ProviderRepository(db)
        self.users = UserRepository(db)

    def _raise_not_found(self, detail: str = "Booking not found"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

    def _ensure_owner_or_admin(self, booking, current_user):
        if current_user.role == "admin":
            return
        if booking.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this booking",
            )

    def _validate_service_and_provider(self, slot: AvailabilitySlot):
        service = self.services.get_by_id(slot.service_id)
        provider = self.providers.get_by_id(slot.provider_id)
        if service is None or not service.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Service is inactive"
            )
        if provider is None or not provider.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Provider is inactive"
            )

    def _generate_reference(self) -> str:
        from app.models.booking import Booking

        while True:
            reference = (
                f"BK-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
                f"-{secrets.token_hex(3).upper()}"
            )
            existing = (
                self.db.query(Booking)
                .filter(Booking.booking_reference == reference)
                .first()
            )
            if existing is None:
                return reference

    def create_booking(self, current_user, slot_id: int, reason: str | None):
        slot = self.bookings.get_slot_with_lock(slot_id)
        if slot is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found"
            )
        if not slot.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Availability slot is inactive"
            )

        now = datetime.now(timezone.utc)
        if slot.start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book a past slot"
            )

        self._validate_service_and_provider(slot)

        if self.bookings.count_active_for_slot(slot.id) >= slot.capacity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The selected slot is no longer available",
            )

        if self.bookings.user_has_active_booking_for_slot(current_user.id, slot.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have an active booking for this slot",
            )

        booking = self.bookings.create(
            booking_reference=self._generate_reference(),
            user_id=current_user.id,
            slot_id=slot.id,
            status="confirmed",
            reason=reason,
        )
        self.bookings.add_history(
            booking_id=booking.id,
            old_status=None,
            new_status="confirmed",
            changed_by=current_user.id,
            change_reason="Booking created",
        )
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def get_booking(self, current_user, booking_id: int):
        booking = self.bookings.get_by_id(booking_id)
        if booking is None:
            self._raise_not_found()
        self._ensure_owner_or_admin(booking, current_user)
        return booking

    def list_customer_bookings(
        self,
        current_user,
        status: str | None = None,
        from_date=None,
        to_date=None,
        page: int = 1,
        page_size: int = 20,
    ):
        from_dt = (
            datetime.combine(from_date, time.min).replace(tzinfo=timezone.utc)
            if from_date is not None
            else None
        )
        to_dt = (
            datetime.combine(to_date, time.max).replace(tzinfo=timezone.utc)
            if to_date is not None
            else None
        )
        return self.bookings.list_for_user(
            current_user.id if current_user.role != "admin" else current_user.id,
            status=status,
            from_date=from_dt,
            to_date=to_dt,
            page=page,
            page_size=page_size,
        )

    def reschedule_booking(
        self,
        current_user,
        booking_id: int,
        new_slot_id: int,
        reason: str | None = None,
    ):
        booking = self.bookings.get_by_id(booking_id)
        if booking is None:
            self._raise_not_found()
        self._ensure_owner_or_admin(booking, current_user)

        if booking.status not in ("pending", "confirmed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking cannot be rescheduled",
            )

        if new_slot_id == booking.slot_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The new slot must be different from the current slot",
            )

        new_slot = self.bookings.get_slot_with_lock(new_slot_id)
        if new_slot is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found"
            )
        if not new_slot.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Availability slot is inactive"
            )

        now = datetime.now(timezone.utc)
        if new_slot.start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reschedule to a past slot"
            )

        self._validate_service_and_provider(new_slot)

        if self.bookings.count_active_for_slot(new_slot.id) >= new_slot.capacity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The selected new slot is no longer available",
            )

        if self.bookings.user_has_active_booking_for_slot(booking.user_id, new_slot.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have an active booking for the new slot",
            )

        old_slot_id = booking.slot_id
        old_status = booking.status
        booking.slot_id = new_slot.id
        # Status remains unchanged; rescheduling does not reset a confirmed booking.
        self.bookings.add_history(
            booking_id=booking.id,
            old_status=old_status,
            new_status=booking.status,
            changed_by=current_user.id,
            change_reason=f"Rescheduled from slot {old_slot_id} to slot {new_slot.id}"
            + (f": {reason}" if reason else ""),
        )
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def cancel_booking(self, current_user, booking_id: int, reason: str | None = None):
        booking = self.bookings.get_by_id(booking_id)
        if booking is None:
            self._raise_not_found()
        self._ensure_owner_or_admin(booking, current_user)

        if booking.status not in ("pending", "confirmed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking cannot be cancelled",
            )

        old_status = booking.status
        booking.status = "cancelled"
        self.bookings.add_history(
            booking_id=booking.id,
            old_status=old_status,
            new_status="cancelled",
            changed_by=current_user.id,
            change_reason=reason or "Booking cancelled",
        )
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def admin_list_bookings(
        self,
        status: str | None = None,
        user_id: int | None = None,
        service_id: int | None = None,
        provider_id: int | None = None,
        from_date=None,
        to_date=None,
        page: int = 1,
        page_size: int = 20,
    ):
        from_dt = (
            datetime.combine(from_date, time.min).replace(tzinfo=timezone.utc)
            if from_date is not None
            else None
        )
        to_dt = (
            datetime.combine(to_date, time.max).replace(tzinfo=timezone.utc)
            if to_date is not None
            else None
        )
        return self.bookings.list_all(
            status=status,
            user_id=user_id,
            service_id=service_id,
            provider_id=provider_id,
            from_date=from_dt,
            to_date=to_dt,
            page=page,
            page_size=page_size,
        )

    def admin_update_status(
        self, current_user, booking_id: int, new_status: str, reason: str | None = None
    ):
        booking = self.bookings.get_by_id(booking_id)
        if booking is None:
            self._raise_not_found()
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

        if new_status not in ALLOWED_STATUS_TRANSITIONS.get(booking.status, set()):
            # Allow staying in same status? no.
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transition from {booking.status} to {new_status} is not allowed",
            )

        old_status = booking.status
        if new_status == "cancelled":
            booking.status = "cancelled"
        elif new_status == "completed":
            booking.status = "completed"
        elif new_status == "confirmed":
            booking.status = "confirmed"
        elif new_status == "pending":
            booking.status = "pending"

        self.bookings.add_history(
            booking_id=booking.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=current_user.id,
            change_reason=reason or "Status updated by administrator",
        )
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def get_history(self, current_user, booking_id: int):
        booking = self.get_booking(current_user, booking_id)
        return self.bookings.get_history(booking.id)
