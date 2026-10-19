from datetime import datetime

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class JobApplication(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    location: Mapped[str | None] = mapped_column(String(180), nullable=True)
    employment_type: Mapped[str] = mapped_column(String(40), nullable=False, default="Full-time")
    job_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Saved", index=True)
    applied_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)
    follow_up_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)
    salary_range: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
