from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from geoalchemy2 import Geometry
from sqlalchemy import ARRAY, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .zone import Zone
    from .station import Station
    from .timetable_stop import TimetableStop


class Train(Base):
    __tablename__ = "trains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    train_number: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    train_type: Mapped[Optional[str]] = mapped_column(String(50))
    source_station_code: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("stations.code"))
    destination_station_code: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("stations.code"))
    distance_km: Mapped[Optional[float]] = mapped_column(Float)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    runs_on: Mapped[Optional[List[bool]]] = mapped_column(ARRAY(Boolean))
    zone_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("zones.id"))
    route_geometry = mapped_column(Geometry(geometry_type="LINESTRING", srid=4326))
    classes: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="trains")
    source_station: Mapped[Optional["Station"]] = relationship(
        "Station", foreign_keys=[source_station_code]
    )
    destination_station: Mapped[Optional["Station"]] = relationship(
        "Station", foreign_keys=[destination_station_code]
    )
    timetable_stops: Mapped[List["TimetableStop"]] = relationship(
        "TimetableStop", back_populates="train", order_by="TimetableStop.stop_number"
    )

    __table_args__ = (
        Index("idx_trains_number", "train_number"),
        Index("idx_trains_source", "source_station_code"),
        Index("idx_trains_dest", "destination_station_code"),
        Index("idx_trains_route_geom", "route_geometry", postgresql_using="gist"),
    )
