from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .train import Train
    from .station import Station


class TimetableStop(Base):
    __tablename__ = "timetable_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    train_id: Mapped[int] = mapped_column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False)
    station_code: Mapped[str] = mapped_column(String(10), ForeignKey("stations.code"), nullable=False)
    stop_number: Mapped[int] = mapped_column(Integer, nullable=False)
    arrival_time = mapped_column(Time, nullable=True)
    departure_time = mapped_column(Time, nullable=True)
    halt_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    distance_from_origin_km: Mapped[Optional[float]] = mapped_column(Float)
    day_offset: Mapped[int] = mapped_column(Integer, default=0)
    platform: Mapped[Optional[str]] = mapped_column(String(10))

    train: Mapped["Train"] = relationship("Train", back_populates="timetable_stops")
    station: Mapped["Station"] = relationship(
        "Station", back_populates="timetable_stops", foreign_keys=[station_code]
    )

    __table_args__ = (
        UniqueConstraint("train_id", "stop_number", name="uq_train_stop_number"),
        UniqueConstraint("train_id", "station_code", name="uq_train_station"),
        Index("idx_stops_train", "train_id"),
        Index("idx_stops_station", "station_code"),
        Index("idx_stops_train_stop", "train_id", "stop_number"),
    )
