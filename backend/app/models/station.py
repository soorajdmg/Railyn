from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from geoalchemy2 import Geography
from sqlalchemy import ARRAY, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .zone import Zone, Division
    from .train import Train
    from .timetable_stop import TimetableStop
    from .railway_line import RailwayLine


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    name_aliases: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    location = mapped_column(Geography(geometry_type="POINT", srid=4326))
    elevation_m: Mapped[Optional[float]] = mapped_column(Float)
    zone_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("zones.id"))
    division_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("divisions.id"))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    is_junction: Mapped[bool] = mapped_column(Boolean, default=False)
    is_terminus: Mapped[bool] = mapped_column(Boolean, default=False)
    platform_count: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="stations")
    division: Mapped[Optional["Division"]] = relationship("Division", back_populates="stations")
    timetable_stops: Mapped[List["TimetableStop"]] = relationship(
        "TimetableStop", back_populates="station", foreign_keys="TimetableStop.station_code"
    )
    station_lines: Mapped[List["StationLine"]] = relationship("StationLine", back_populates="station")

    __table_args__ = (
        Index("idx_stations_code", "code"),
        Index("idx_stations_location", "location", postgresql_using="gist"),
    )


class StationLine(Base):
    __tablename__ = "station_lines"

    station_code: Mapped[str] = mapped_column(String(10), ForeignKey("stations.code"), primary_key=True)
    railway_line_id: Mapped[int] = mapped_column(Integer, ForeignKey("railway_lines.id"), primary_key=True)

    station: Mapped["Station"] = relationship("Station", back_populates="station_lines")
    railway_line: Mapped["RailwayLine"] = relationship("RailwayLine", back_populates="station_lines")
