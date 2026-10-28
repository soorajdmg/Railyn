from __future__ import annotations
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.station import Station
from app.models.train import Train
from app.schemas.search import SearchResult, ServiceResult


async def search_all(db: AsyncSession, q: str, limit: int = 20) -> list[SearchResult]:
    results = []

    # If purely numeric, search train numbers first
    if q.isdigit():
        train_query = select(Train).where(Train.train_number.like(f"{q}%")).limit(5)
        trains = (await db.execute(train_query)).scalars().all()
        for t in trains:
            results.append(SearchResult(
                type="train",
                id=t.id,
                code=t.train_number,
                name=t.name,
                subtext=f"{t.train_type or 'Train'} · {t.source_station_code} → {t.destination_station_code}",
            ))

    # Search stations by code exact match first
    station_code_query = select(Station).where(Station.code.ilike(q)).limit(3)
    stations_exact = (await db.execute(station_code_query)).scalars().all()
    seen_station_ids = set()
    for s in stations_exact:
        seen_station_ids.add(s.id)
        results.append(SearchResult(
            type="station",
            id=s.id,
            code=s.code,
            name=s.name,
            subtext=s.state,
        ))

    # Search trains by name
    train_name_query = (
        select(Train)
        .where(Train.name.ilike(f"%{q}%") | Train.train_number.ilike(f"%{q}%"))
        .limit(10)
    )
    trains_by_name = (await db.execute(train_name_query)).scalars().all()
    seen_train_ids = {r.id for r in results if r.type == "train"}
    for t in trains_by_name:
        if t.id not in seen_train_ids:
            seen_train_ids.add(t.id)
            results.append(SearchResult(
                type="train",
                id=t.id,
                code=t.train_number,
                name=t.name,
                subtext=f"{t.train_type or 'Train'} · {t.source_station_code} → {t.destination_station_code}",
            ))

    # Search stations by name
    station_name_query = (
        select(Station)
        .where(Station.name.ilike(f"%{q}%") | Station.code.ilike(f"%{q}%"))
        .limit(10)
    )
    stations_by_name = (await db.execute(station_name_query)).scalars().all()
    for s in stations_by_name:
        if s.id not in seen_station_ids:
            seen_station_ids.add(s.id)
            results.append(SearchResult(
                type="station",
                id=s.id,
                code=s.code,
                name=s.name,
                subtext=s.state,
            ))

    return results[:limit]


async def get_services_between(
    db: AsyncSession, from_code: str, to_code: str
) -> list[ServiceResult]:
    query = text("""
        SELECT DISTINCT
            t.train_number,
            t.name as train_name,
            t.train_type,
            t.classes,
            t.runs_on,
            s1.departure_time as from_departure,
            s2.arrival_time as to_arrival,
            (s2.distance_from_origin_km - s1.distance_from_origin_km) as distance_km,
            (
                (s2.day_offset - s1.day_offset) * 1440 +
                EXTRACT(EPOCH FROM (s2.arrival_time - s1.departure_time)) / 60
            )::int as duration_minutes
        FROM trains t
        JOIN timetable_stops s1 ON s1.train_id = t.id AND s1.station_code = :from_code
        JOIN timetable_stops s2 ON s2.train_id = t.id AND s2.station_code = :to_code
        WHERE s1.stop_number < s2.stop_number
        ORDER BY s1.departure_time
    """)
    result = await db.execute(query, {"from_code": from_code.upper(), "to_code": to_code.upper()})
    rows = result.mappings().all()

    services = []
    for row in rows:
        r = dict(row)
        services.append(ServiceResult(
            train_number=r["train_number"],
            train_name=r["train_name"],
            train_type=r.get("train_type"),
            classes=r.get("classes") or [],
            runs_on=r.get("runs_on") or [],
            from_departure=str(r["from_departure"]) if r.get("from_departure") else None,
            to_arrival=str(r["to_arrival"]) if r.get("to_arrival") else None,
            distance_km=r.get("distance_km"),
            duration_minutes=r.get("duration_minutes"),
        ))
    return services
