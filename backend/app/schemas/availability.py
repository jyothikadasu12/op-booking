from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AvailabilityBase(BaseModel):
    service_id: int = Field(gt=0)
    provider_id: int = Field(gt=0)
    start_time: datetime
    end_time: datetime
    capacity: int = Field(gt=0, default=1)
    is_active: bool = True

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityUpdate(BaseModel):
    service_id: int | None = Field(default=None, gt=0)
    provider_id: int | None = Field(default=None, gt=0)
    start_time: datetime | None = None
    end_time: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    provider_id: int
    start_time: datetime
    end_time: datetime
    capacity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AvailabilityStatusUpdate(BaseModel):
    is_active: bool
