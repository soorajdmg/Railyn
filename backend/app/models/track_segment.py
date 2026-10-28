from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .railway_line import RailwayLine


class TrackSegment(Base):
    __tablename__ = "track_segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    from_station_code: Mapped[str] = mapped_column(String(10), ForeignKey("stations.code"), nullable=False)
    to_station_code: Mapped[str] = mapped_column(String(10), ForeignKey("stations.code"), nullable=False)
    railway_line_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("railway_lines.id"))
    geometry = mapped_column(Geometry(geometry_type="LINESTRING", srid=4326), nullable=False)
    length_km: Mapped[Optional[float]] = mapped_column(Float)
    gauge: Mapped[str] = mapped_column(String(20), default="BG")
    electrified: Mapped[bool] = mapped_column(Boolean, default=False)
    max_speed_kmph: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    railway_line: Mapped[Optional["RailwayLine"]] = relationship("RailwayLine", back_populates="track_segments")

    __table_args__ = (
        UniqueConstraint("from_station_code", "to_station_code", name="uq_segment_from_to"),
        Index("idx_segments_from", "from_station_code"),
        Index("idx_segments_to", "to_station_code"),
        Index("idx_segments_geom", "geometry", postgresql_using="gist"),
    )
