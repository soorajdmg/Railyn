from __future__ import annotations
from typing import Any

from pydantic import BaseModel, field_validator

from .zone import DivisionSummary, ZoneSummary


class StationSummary(BaseModel):
    id: int
    name: str
    code: str
    state: str | None = None
    is_junction: bool = False
    is_terminus: bool = False

    model_config = {"from_attributes": True}


class RailwayLineSummary(BaseModel):
    id: int
    name: str
    code: str | None = None

    model_config = {"from_attributes": True}


class StationDetail(StationSummary):
    name_aliases: list[str] | None = None
    location: dict | None = None  # GeoJSON Point
    elevation_m: float | None = None
    zone_id: int | None = None
    division_id: int | None = None
    platform_count: int | None = None
    zone: ZoneSummary | None = None
    division: DivisionSummary | None = None
    lines: list[RailwayLineSummary] = []
    trains_count: int = 0


class PaginatedStations(BaseModel):
    items: list[StationSummary]
    total: int
    page: int
    limit: int


class StationGeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class StationGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: list[StationGeoJSONFeature]
