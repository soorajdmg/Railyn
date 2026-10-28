from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/network", summary="Railway network as GeoJSON")
async def get_network(db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT
            id,
            from_station_code,
            to_station_code,
            gauge,
            electrified,
            ST_AsGeoJSON(geometry)::json as geometry
        FROM track_segments
        WHERE geometry IS NOT NULL
    """)
    result = await db.execute(query)
    rows = result.mappings().all()

    features = []
    for row in rows:
        r = dict(row)
        if r.get("geometry"):
            features.append({
                "type": "Feature",
                "geometry": r["geometry"],
                "properties": {
                    "from": r["from_station_code"],
                    "to": r["to_station_code"],
                    "gauge": r["gauge"],
                    "electrified": r["electrified"],
                },
            })

    return {"type": "FeatureCollection", "features": features}
