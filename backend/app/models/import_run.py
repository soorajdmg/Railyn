from __future__ import annotations
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ImportRun(Base):
    __tablename__ = "import_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(255))
    entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    records_total: Mapped[Optional[int]] = mapped_column(Integer)
    records_inserted: Mapped[Optional[int]] = mapped_column(Integer)
    records_updated: Mapped[Optional[int]] = mapped_column(Integer)
    records_skipped: Mapped[Optional[int]] = mapped_column(Integer)
    errors_count: Mapped[Optional[int]] = mapped_column(Integer)
    error_log: Mapped[Optional[str]] = mapped_column(Text)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
