from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ConferenceBase(BaseModel):
    name: str
    acronym: str | None = None
    research_field: str | None = None
    official_url: str | None = None
    submission_deadline: date | None = None
    conference_date: date | None = None
    location: str | None = None
    source: str | None = None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(BaseModel):
    name: str | None = None
    acronym: str | None = None
    research_field: str | None = None
    official_url: str | None = None
    submission_deadline: date | None = None
    conference_date: date | None = None
    location: str | None = None
    source: str | None = None


class ConferenceResponse(ConferenceBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)