from datetime import date, datetime, time, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.availability_slot import AvailabilitySlot
from app.models.booking import Booking
from app.models.provider import Provider
from app.models.service import Service


class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def dashboard_summary(self) -> dict:
        today = datetime.now(timezone.utc).date()
        day_start = datetime.combine(today, time.min).replace(tzinfo=timezone.utc)
        day_end = datetime.combine(today, time.max).replace(tzinfo=timezone.utc)

        def count_status(status_value: str) -> int:
            return (
                self.db.query(func.count(Booking.id))
                .filter(Booking.status == status_value)
                .scalar()
                or 0
            )

        return {
            "total_bookings": self.db.query(func.count(Booking.id)).scalar() or 0,
            "today_bookings": (
                self.db.query(func.count(Booking.id))
                .join(AvailabilitySlot, Booking.slot_id == AvailabilitySlot.id)
                .filter(
                    AvailabilitySlot.start_time >= day_start,
                    AvailabilitySlot.start_time <= day_end,
                )
                .scalar()
                or 0
            ),
            "pending_bookings": count_status("pending"),
            "confirmed_bookings": count_status("confirmed"),
            "completed_bookings": count_status("completed"),
            "cancelled_bookings": count_status("cancelled"),
            "active_services": (
                self.db.query(func.count(Service.id))
                .filter(Service.is_active.is_(True))
                .scalar()
                or 0
            ),
            "active_providers": (
                self.db.query(func.count(Provider.id))
                .filter(Provider.is_active.is_(True))
                .scalar()
                or 0
            ),
        }
