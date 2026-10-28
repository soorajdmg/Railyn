from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .zone import Zone
    from .station import StationLine
    from .track_segment import TrackSegment


class RailwayLine(Base):
    __tablename__ = "railway_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(50))
    line_type: Mapped[Optional[str]] = mapped_column(String(50))
    gauge: Mapped[str] = mapped_column(String(20), default="BG")
    electrified: Mapped[bool] = mapped_column(Boolean, default=False)
    zone_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("zones.id"))
    geometry = mapped_column(Geometry(geometry_type="LINESTRING", srid=4326))
    length_km: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="railway_lines")
    station_lines: Mapped[List["StationLine"]] = relationship("StationLine", back_populates="railway_line")
    track_segments: Mapped[List["TrackSegment"]] = relationship("TrackSegment", back_populates="railway_line")

    __table_args__ = (
        Index("idx_railway_lines_geom", "geometry", postgresql_using="gist"),
    )
