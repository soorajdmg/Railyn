from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.crud import trains as crud
from app.schemas.train import (
    PaginatedTrains,
    TimetableStopSchema,
    TrainDetail,
    TrainGeoJSON,
    TrainSummary,
    TrainTimetable,
)

router = APIRouter(prefix="/trains", tags=["trains"])


@router.get("", response_model=PaginatedTrains, summary="List trains")
async def list_trains(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    train_type: str | None = None,
    zone: str | None = None,
    q: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    trains, total = await crud.get_trains(db, page, limit, train_type, zone, q)
    return PaginatedTrains(
        items=[TrainSummary.model_validate(t) for t in trains],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{number}", response_model=TrainDetail, summary="Train detail")
async def get_train(number: str, db: AsyncSession = Depends(get_db)):
    train = await crud.get_train_by_number(db, number)
    if not train:
        raise NotFoundException(f"Train '{number}' not found")
    return TrainDetail.model_validate(train)


@router.get("/{number}/timetable", response_model=TrainTimetable, summary="Train timetable")
async def get_timetable(number: str, db: AsyncSession = Depends(get_db)):
    train, stops = await crud.get_train_timetable(db, number)
    if not train:
        raise NotFoundException(f"Train '{number}' not found")

    stop_schemas = []
    for stop in stops:
        s = TimetableStopSchema(
            id=stop.id,
            train_id=stop.train_id,
            station_code=stop.station_code,
            station_name=stop.station.name if stop.station else None,
            stop_number=stop.stop_number,
            arrival_time=str(stop.arrival_time) if stop.arrival_time else None,
            departure_time=str(stop.departure_time) if stop.departure_time else None,
            halt_minutes=stop.halt_minutes,
            distance_from_origin_km=stop.distance_from_origin_km,
            day_offset=stop.day_offset or 0,
            platform=stop.platform,
        )
        stop_schemas.append(s)

    return TrainTimetable(
        train=TrainDetail.model_validate(train),
        stops=stop_schemas,
    )


@router.get("/{number}/geojson", response_model=TrainGeoJSON, summary="Train route as GeoJSON")
async def get_route_geojson(number: str, db: AsyncSession = Depends(get_db)):
    route = await crud.get_train_route_geojson(db, number)
    if not route or not route.get("geometry"):
        raise NotFoundException(f"No route geometry for train '{number}'")

    return TrainGeoJSON(
        geometry=route["geometry"],
        properties={
            "train_number": route["train_number"],
            "name": route["name"],
        },
    )
