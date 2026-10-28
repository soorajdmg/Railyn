from __future__ import annotations
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.station import Station, StationLine
from app.models.train import Train
from app.models.timetable_stop import TimetableStop
from app.utils.geo import point_to_geojson


async def get_stations(
    db: AsyncSession,
    page: int = 1,
    limit: int = 50,
    zone: str | None = None,
    division: str | None = None,
    state: str | None = None,
    junctions_only: bool = False,
    q: str | None = None,
) -> tuple[list[Station], int]:
    query = select(Station)

    if zone:
        from app.models.zone import Zone
        query = query.join(Zone, Station.zone_id == Zone.id).where(Zone.code == zone)
    if division:
        from app.models.zone import Division
        query = query.join(Division, Station.division_id == Division.id).where(Division.code == division)
    if state:
        query = query.where(Station.state.ilike(f"%{state}%"))
    if junctions_only:
        query = query.where(Station.is_junction == True)
    if q:
        query = query.where(
            (Station.name.ilike(f"%{q}%")) | (Station.code.ilike(f"%{q}%"))
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.offset((page - 1) * limit).limit(limit).order_by(Station.name)
    result = await db.execute(query)
    return result.scalars().all(), total


async def get_station_by_code(db: AsyncSession, code: str) -> Station | None:
    query = (
        select(Station)
        .where(Station.code == code.upper())
        .options(
            selectinload(Station.zone),
            selectinload(Station.division),
            selectinload(Station.station_lines).selectinload(StationLine.railway_line),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_station_trains(
    db: AsyncSession, code: str, page: int = 1, limit: int = 20
) -> tuple[list[Train], int]:
    subquery = (
        select(TimetableStop.train_id)
        .where(TimetableStop.station_code == code.upper())
        .distinct()
    )
    query = select(Train).where(Train.id.in_(subquery))
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    query = query.offset((page - 1) * limit).limit(limit).order_by(Train.name)
    result = await db.execute(query)
    return result.scalars().all(), total


async def get_stations_geojson(db: AsyncSession) -> list[dict]:
    from sqlalchemy import text
    query = """
        SELECT
            s.id,
            s.code,
            s.name,
            s.is_junction,
            s.is_terminus,
            s.state,
            z.code as zone_code,
            ST_AsGeoJSON(s.location)::json as geometry
        FROM stations s
        LEFT JOIN zones z ON z.id = s.zone_id
        WHERE s.location IS NOT NULL
    """
    result = await db.execute(text(query))
    rows = result.mappings().all()
    return [dict(r) for r in rows]
