from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.crud import stations as crud
from app.schemas.station import (
    PaginatedStations,
    StationDetail,
    StationGeoJSON,
    StationGeoJSONFeature,
    StationSummary,
)
from app.schemas.train import PaginatedTrains, TrainSummary
from app.utils.geo import point_to_geojson

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get("", response_model=PaginatedStations, summary="List stations")
async def list_stations(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    zone: str | None = None,
    division: str | None = None,
    state: str | None = None,
    junctions_only: bool = False,
    q: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stations, total = await crud.get_stations(db, page, limit, zone, division, state, junctions_only, q)
    return PaginatedStations(
        items=[StationSummary.model_validate(s) for s in stations],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/geojson", response_model=StationGeoJSON, summary="All stations as GeoJSON")
async def stations_geojson(db: AsyncSession = Depends(get_db)):
    rows = await crud.get_stations_geojson(db)
    features = []
    for row in rows:
        if row.get("geometry"):
            features.append(StationGeoJSONFeature(
                geometry=row["geometry"],
                properties={
                    "id": row["id"],
                    "code": row["code"],
                    "name": row["name"],
                    "is_junction": row["is_junction"],
                    "is_terminus": row["is_terminus"],
                    "state": row["state"],
                    "zone_code": row.get("zone_code"),
                },
            ))
    return StationGeoJSON(features=features)


@router.get("/{code}", response_model=StationDetail, summary="Station detail")
async def get_station(code: str, db: AsyncSession = Depends(get_db)):
    station = await crud.get_station_by_code(db, code)
    if not station:
        raise NotFoundException(f"Station '{code}' not found")

    trains_count = (await crud.get_station_trains(db, code, limit=1))[1]

    lines = []
    if hasattr(station, 'station_lines'):
        lines = [
            {"id": sl.railway_line.id, "name": sl.railway_line.name, "code": sl.railway_line.code}
            for sl in station.station_lines
            if sl.railway_line
        ]

    return StationDetail(
        id=station.id,
        name=station.name,
        code=station.code,
        state=station.state,
        is_junction=station.is_junction or False,
        is_terminus=station.is_terminus or False,
        name_aliases=station.name_aliases,
        location=point_to_geojson(station.location),
        elevation_m=station.elevation_m,
        zone_id=station.zone_id,
        division_id=station.division_id,
        platform_count=station.platform_count,
        zone=station.zone,
        division=station.division,
        lines=lines,
        trains_count=trains_count,
    )


@router.get("/{code}/trains", response_model=PaginatedTrains, summary="Trains at a station")
async def station_trains(
    code: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    trains, total = await crud.get_station_trains(db, code, page, limit)
    return PaginatedTrains(
        items=[TrainSummary.model_validate(t) for t in trains],
        total=total,
        page=page,
        limit=limit,
    )
