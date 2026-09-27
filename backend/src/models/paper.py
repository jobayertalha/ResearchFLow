from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, Table
from sqlalchemy.orm import relationship

from ..database import Base


# Many-to-many relationship between papers and conferences
paper_conferences = Table(
    "paper_conferences",
    Base.metadata,
    Column(
        "paper_id",
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "conference_id",
        Integer,
        ForeignKey("conferences.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(255), nullable=False)
    research_field = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)

    # Legacy fields kept temporarily so existing papers do not break.
    # New conference management will use the many-to-many relationship below.
    conference_name = Column(String(255), nullable=True)
    conference_url = Column(String(500), nullable=True)
    deadline = Column(Date, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="active",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    # User who owns the paper
    user = relationship(
        "User",
        back_populates="papers",
    )

    # Tasks belonging to this paper
    tasks = relationship(
        "Task",
        back_populates="paper",
        cascade="all, delete-orphan",
        order_by="Task.position",
    )

    # Conferences associated with this paper
    conferences = relationship(
        "Conference",
        secondary="paper_conferences",
        back_populates="papers",
    )