from __future__ import annotations
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.train import Train
from app.models.timetable_stop import TimetableStop


async def get_trains(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    train_type: str | None = None,
    zone: str | None = None,
    q: str | None = None,
) -> tuple[list[Train], int]:
    query = select(Train)

    if train_type:
        query = query.where(Train.train_type.ilike(f"%{train_type}%"))
    if zone:
        from app.models.zone import Zone
        query = query.join(Zone, Train.zone_id == Zone.id).where(Zone.code == zone)
    if q:
        query = query.where(
            (Train.name.ilike(f"%{q}%")) | (Train.train_number.ilike(f"%{q}%"))
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    query = query.offset((page - 1) * limit).limit(limit).order_by(Train.train_number)
    result = await db.execute(query)
    return result.scalars().all(), total


async def get_train_by_number(db: AsyncSession, number: str) -> Train | None:
    query = (
        select(Train)
        .where(Train.train_number == number)
        .options(
            selectinload(Train.zone),
            selectinload(Train.source_station),
            selectinload(Train.destination_station),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_train_timetable(db: AsyncSession, number: str) -> tuple[Train | None, list[TimetableStop]]:
    train = await get_train_by_number(db, number)
    if not train:
        return None, []

    query = (
        select(TimetableStop)
        .where(TimetableStop.train_id == train.id)
        .options(selectinload(TimetableStop.station))
        .order_by(TimetableStop.stop_number)
    )
    result = await db.execute(query)
    stops = result.scalars().all()
    return train, stops


async def get_train_route_geojson(db: AsyncSession, number: str) -> dict | None:
    from sqlalchemy import text
    query = text("""
        SELECT
            t.train_number,
            t.name,
            ST_AsGeoJSON(t.route_geometry)::json as geometry
        FROM trains t
        WHERE t.train_number = :number AND t.route_geometry IS NOT NULL
    """)
    result = await db.execute(query, {"number": number})
    row = result.mappings().first()
    if not row:
        return None
    return dict(row)
