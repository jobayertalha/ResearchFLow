from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="Other")
    position = Column(Integer, nullable=False, default=0)
    completed = Column(Boolean, default=False, nullable=False)
    due_date = Column(Date, nullable=True)

    paper = relationship("Paper", back_populates="tasks")
