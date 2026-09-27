from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    acronym: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    research_field: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    official_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    submission_deadline: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    conference_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    source: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # Papers associated with this conference
    papers = relationship(
        "Paper",
        secondary="paper_conferences",
        back_populates="conferences",
    )