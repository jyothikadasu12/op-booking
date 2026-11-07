from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard successful API response."""

    success: bool = True
    message: str = ""
    data: T | None = None


class ErrorResponse(BaseModel):
    """Standard error API response."""

    success: False = False
    message: str
    error_code: str | None = None
    errors: list[Any] = []


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    model_config = ConfigDict(from_attributes=True)

    page: int
    page_size: int
    total: int
    total_pages: int
