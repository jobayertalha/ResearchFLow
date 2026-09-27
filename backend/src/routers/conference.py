from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Conference
from ..schemas import ConferenceCreate, ConferenceUpdate
from ..security import auth

router = APIRouter(prefix="/conferences", tags=["Conferences"])


def get_owned_conference(
    conference_id: int,
    db: Session,
    user_id: int,
) -> Conference:
    conference = (
        db.query(Conference)
        .filter(
            Conference.id == conference_id,
            Conference.user_id == user_id,
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found",
        )

    return conference


def conference_response(conference: Conference):
    return {
        "id": conference.id,
        "name": conference.name,
        "acronym": conference.acronym,
        "research_field": conference.research_field,
        "official_url": conference.official_url,
        "submission_deadline": conference.submission_deadline,
        "conference_date": conference.conference_date,
        "location": conference.location,
        "source": conference.source,
        "user_id": conference.user_id,
        "created_at": conference.created_at,
    }


@router.get("")
def get_conferences(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    conferences = (
        db.query(Conference)
        .filter(Conference.user_id == current_user.id)
        .order_by(Conference.created_at.desc())
        .all()
    )

    return [conference_response(conference) for conference in conferences]


@router.post("")
def create_conference(
    payload: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    conference = Conference(
        **payload.model_dump(),
        user_id=current_user.id,
    )

    db.add(conference)
    db.commit()
    db.refresh(conference)

    return conference_response(conference)


@router.get("/{conference_id}")
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    conference = get_owned_conference(
        conference_id,
        db,
        current_user.id,
    )

    return conference_response(conference)


@router.put("/{conference_id}")
def update_conference(
    conference_id: int,
    payload: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    conference = get_owned_conference(
        conference_id,
        db,
        current_user.id,
    )

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(conference, key, value)

    db.commit()
    db.refresh(conference)

    return conference_response(conference)


@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    conference = get_owned_conference(
        conference_id,
        db,
        current_user.id,
    )

    db.delete(conference)
    db.commit()

    return {"message": "Conference deleted"}