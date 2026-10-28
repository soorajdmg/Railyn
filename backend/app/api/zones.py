from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.crud import zones as crud
from app.schemas.zone import DivisionDetail, DivisionSummary, ZoneDetail, ZoneSummary

router = APIRouter(tags=["zones"])


@router.get("/zones", response_model=list[ZoneSummary], summary="List all zones")
async def list_zones(db: AsyncSession = Depends(get_db)):
    zones = await crud.get_zones(db)
    return [ZoneSummary.model_validate(z) for z in zones]


@router.get("/zones/{code}", response_model=ZoneDetail, summary="Zone detail")
async def get_zone(code: str, db: AsyncSession = Depends(get_db)):
    zone = await crud.get_zone_by_code(db, code)
    if not zone:
        raise NotFoundException(f"Zone '{code}' not found")
    return ZoneDetail.model_validate(zone)


@router.get("/divisions", response_model=list[DivisionSummary], summary="List all divisions")
async def list_divisions(db: AsyncSession = Depends(get_db)):
    divisions = await crud.get_divisions(db)
    return [DivisionSummary.model_validate(d) for d in divisions]


@router.get("/divisions/{code}", response_model=DivisionDetail, summary="Division detail")
async def get_division(code: str, db: AsyncSession = Depends(get_db)):
    division = await crud.get_division_by_code(db, code)
    if not division:
        raise NotFoundException(f"Division '{code}' not found")
    detail = DivisionDetail.model_validate(division)
    return detail
