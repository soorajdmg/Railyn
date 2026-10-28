from __future__ import annotations
from pydantic import BaseModel


class ZoneSummary(BaseModel):
    id: int
    name: str
    code: str
    hq_city: str | None = None
    hq_station_code: str | None = None
    website: str | None = None

    model_config = {"from_attributes": True}


class DivisionSummary(BaseModel):
    id: int
    name: str
    code: str
    zone_id: int
    hq_city: str | None = None
    hq_station_code: str | None = None

    model_config = {"from_attributes": True}


class DivisionDetail(DivisionSummary):
    zone: ZoneSummary | None = None
    stations_count: int = 0


class ZoneDetail(ZoneSummary):
    divisions: list[DivisionSummary] = []
