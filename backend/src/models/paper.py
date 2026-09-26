from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    research_field = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)
    conference_name = Column(String(255), nullable=True)
    conference_url = Column(String(500), nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(String(30), nullable=False, default="active")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="papers")
    tasks = relationship("Task", back_populates="paper", cascade="all, delete-orphan", order_by="Task.position")
