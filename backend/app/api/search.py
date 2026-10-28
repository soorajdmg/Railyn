from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ValidationException
from app.crud.search import get_services_between, search_all
from app.schemas.search import SearchResponse, ServiceResult

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse, summary="Search trains and stations")
async def search(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    results = await search_all(db, q)
    return SearchResponse(results=results, query=q, total=len(results))


@router.get("/search/trains", response_model=SearchResponse, summary="Search trains")
async def search_trains(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    all_results = await search_all(db, q)
    train_results = [r for r in all_results if r.type == "train"]
    return SearchResponse(results=train_results, query=q, total=len(train_results))


@router.get("/search/stations", response_model=SearchResponse, summary="Search stations")
async def search_stations(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    all_results = await search_all(db, q)
    station_results = [r for r in all_results if r.type == "station"]
    return SearchResponse(results=station_results, query=q, total=len(station_results))


@router.get("/services", response_model=list[ServiceResult], summary="Services between two stations")
async def services_between(
    from_: str = Query(..., alias="from"),
    to: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if not from_ or not to:
        raise ValidationException("Both 'from' and 'to' station codes are required")
    return await get_services_between(db, from_, to)
