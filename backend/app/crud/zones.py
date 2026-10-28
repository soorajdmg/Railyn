from __future__ import annotations
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.zone import Division, Zone


async def get_zones(db: AsyncSession) -> list[Zone]:
    query = select(Zone).order_by(Zone.name)
    result = await db.execute(query)
    return result.scalars().all()


async def get_zone_by_code(db: AsyncSession, code: str) -> Zone | None:
    query = (
        select(Zone)
        .where(Zone.code == code.upper())
        .options(selectinload(Zone.divisions))
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_divisions(db: AsyncSession) -> list[Division]:
    query = select(Division).options(selectinload(Division.zone)).order_by(Division.name)
    result = await db.execute(query)
    return result.scalars().all()


async def get_division_by_code(db: AsyncSession, code: str) -> Division | None:
    query = (
        select(Division)
        .where(Division.code == code.upper())
        .options(selectinload(Division.zone))
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()
