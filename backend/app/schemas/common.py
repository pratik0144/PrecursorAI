from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    next_cursor: Optional[str] = None
    has_more: bool

class CursorPaginationParams(BaseModel):
    cursor: Optional[str] = None
    limit: int = 50

class ErrorResponse(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str
    instance: Optional[str] = None
    error_id: Optional[str] = None
