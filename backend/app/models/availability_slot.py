from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AvailabilitySlot(Base):
    """Bookable appointment time slot."""

    __tablename__ = "availability_slots"

    __table_args__ = (
        CheckConstraint(
            "end_time > start_time", name="ck_availability_slot_time_range"
        ),
        CheckConstraint("capacity > 0", name="ck_availability_slot_capacity"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    provider_id: Mapped[int] = mapped_column(
        ForeignKey("providers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    service: Mapped["Service"] = relationship(
        "Service", back_populates="availability_slots"
    )
    provider: Mapped["Provider"] = relationship(
        "Provider", back_populates="availability_slots"
    )
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="slot"
    )
