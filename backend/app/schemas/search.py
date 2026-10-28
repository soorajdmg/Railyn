from __future__ import annotations
from pydantic import BaseModel


class SearchResult(BaseModel):
    type: str  # 'train' or 'station'
    id: int
    code: str
    name: str
    subtext: str | None = None


class SearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    total: int


class ServiceResult(BaseModel):
    train_number: str
    train_name: str
    train_type: str | None = None
    classes: list[str] = []
    runs_on: list[bool] = []
    from_departure: str | None = None
    to_arrival: str | None = None
    duration_minutes: int | None = None
    distance_km: float | None = None
