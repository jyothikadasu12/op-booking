from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    duration_minutes: int = Field(gt=0)
    price: float = Field(ge=0)
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    duration_minutes: int
    price: float
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ServiceStatusUpdate(BaseModel):
    is_active: bool
