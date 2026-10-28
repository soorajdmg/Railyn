from __future__ import annotations
from pydantic import BaseModel

from .zone import ZoneSummary


class StationRef(BaseModel):
    code: str
    name: str

    model_config = {"from_attributes": True}


class TrainSummary(BaseModel):
    id: int
    train_number: str
    name: str
    train_type: str | None = None
    source_station_code: str | None = None
    destination_station_code: str | None = None
    distance_km: float | None = None
    duration_minutes: int | None = None
    runs_on: list[bool] | None = None
    classes: list[str] | None = None

    model_config = {"from_attributes": True}


class TrainDetail(TrainSummary):
    zone_id: int | None = None
    zone: ZoneSummary | None = None
    source_station: StationRef | None = None
    destination_station: StationRef | None = None


class TimetableStopSchema(BaseModel):
    id: int
    train_id: int
    station_code: str
    station_name: str | None = None
    stop_number: int
    arrival_time: str | None = None
    departure_time: str | None = None
    halt_minutes: int | None = None
    distance_from_origin_km: float | None = None
    day_offset: int = 0
    platform: str | None = None

    model_config = {"from_attributes": True}


class TrainTimetable(BaseModel):
    train: TrainDetail
    stops: list[TimetableStopSchema]


class PaginatedTrains(BaseModel):
    items: list[TrainSummary]
    total: int
    page: int
    limit: int


class TrainGeoJSON(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict
