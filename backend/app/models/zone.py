from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .station import Station
    from .train import Train
    from .railway_line import RailwayLine


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    hq_city: Mapped[Optional[str]] = mapped_column(String(100))
    hq_station_code: Mapped[Optional[str]] = mapped_column(String(10))
    website: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    divisions: Mapped[List["Division"]] = relationship("Division", back_populates="zone")
    stations: Mapped[List["Station"]] = relationship("Station", back_populates="zone")
    trains: Mapped[List["Train"]] = relationship("Train", back_populates="zone")
    railway_lines: Mapped[List["RailwayLine"]] = relationship("RailwayLine", back_populates="zone")


class Division(Base):
    __tablename__ = "divisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("zones.id"), nullable=False)
    hq_city: Mapped[Optional[str]] = mapped_column(String(100))
    hq_station_code: Mapped[Optional[str]] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    zone: Mapped["Zone"] = relationship("Zone", back_populates="divisions")
    stations: Mapped[List["Station"]] = relationship("Station", back_populates="division")
