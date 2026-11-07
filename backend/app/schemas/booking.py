from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


VALID_BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"]


class BookingCreate(BaseModel):
    slot_id: int = Field(gt=0)
    reason: str | None = Field(default=None, max_length=1000)


class BookingReschedule(BaseModel):
    new_slot_id: int = Field(gt=0)


class BookingCancel(BaseModel):
    reason: str | None = Field(default=None, max_length=1000)


class BookingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|confirmed|cancelled|completed)$")
    reason: str | None = Field(default=None, max_length=1000)


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_reference: str
    user_id: int
    slot_id: int
    status: str
    reason: str | None = None
    created_at: datetime
    updated_at: datetime


class BookingHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    old_status: str | None = None
    new_status: str
    changed_by: int | None = None
    change_reason: str | None = None
    changed_at: datetime
