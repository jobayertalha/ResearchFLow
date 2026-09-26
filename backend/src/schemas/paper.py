from datetime import date
from pydantic import BaseModel, Field


class PaperCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    research_field: str | None = None
    description: str | None = None
    conference_name: str | None = None
    conference_url: str | None = None
    deadline: date | None = None


class PaperUpdate(PaperCreate):
    status: str | None = None
