from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProviderBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    is_active: bool = True


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    bio: str | None = None
    is_active: bool | None = None


class ProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    specialization: str | None = None
    bio: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProviderStatusUpdate(BaseModel):
    is_active: bool
