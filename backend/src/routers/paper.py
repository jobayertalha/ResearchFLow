from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Conference, Paper
from ..schemas import PaperCreate, PaperUpdate
from ..security import auth

router = APIRouter(prefix="/papers", tags=["Papers"])


# ============================================================
# HELPERS
# ============================================================

def get_owned_paper(
    paper_id: int,
    db: Session,
    user_id: int,
) -> Paper:
    paper = (
        db.query(Paper)
        .filter(
            Paper.id == paper_id,
            Paper.user_id == user_id,
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found",
        )

    return paper


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
    days_until_deadline = None

    if conference.submission_deadline:
        days_until_deadline = (
            conference.submission_deadline - date.today()
        ).days

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
        "days_until_deadline": days_until_deadline,
    }


def paper_response(paper: Paper):
    total = len(paper.tasks)
    completed = sum(1 for task in paper.tasks if task.completed)

    progress = (
        round((completed / total) * 100)
        if total
        else 0
    )

    # -------------------------------------------------
    # Determine the effective deadline for this paper
    # -------------------------------------------------
    #
    # If the paper has one or more linked conferences,
    # use the earliest conference submission deadline.
    #
    # Otherwise, fall back to the legacy paper.deadline.
    # -------------------------------------------------

    conference_deadlines = [
        conference.submission_deadline
        for conference in paper.conferences
        if conference.submission_deadline is not None
    ]

    effective_deadline = None
    deadline_source = None

    if conference_deadlines:
        effective_deadline = min(conference_deadlines)
        deadline_source = "conference"
    elif paper.deadline:
        effective_deadline = paper.deadline
        deadline_source = "paper"

    # Calculate remaining days
    days_left = None

    if effective_deadline:
        days_left = (
            effective_deadline - date.today()
        ).days

    return {
        "id": paper.id,
        "title": paper.title,
        "research_field": paper.research_field,
        "description": paper.description,

        # Legacy fields
        "conference_name": paper.conference_name,
        "conference_url": paper.conference_url,

        # Effective deadline
        "deadline": effective_deadline,
        "deadline_source": deadline_source,

        "status": paper.status,
        "created_at": paper.created_at,
        "completed_at": paper.completed_at,

        "total_tasks": total,
        "completed_tasks": completed,
        "progress": progress,
        "days_left": days_left,

        # Linked conferences
        "conferences": [
            conference_response(conference)
            for conference in paper.conferences
        ],
    }
# ============================================================
# PAPER CRUD
# ============================================================

@router.get("")
def get_papers(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    papers = (
        db.query(Paper)
        .filter(Paper.user_id == current_user.id)
        .order_by(Paper.created_at.desc())
        .all()
    )

    return [
        paper_response(paper)
        for paper in papers
    ]


@router.post("")
def create_paper(
    payload: PaperCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = Paper(
        **payload.model_dump(),
        user_id=current_user.id,
    )

    db.add(paper)
    db.commit()
    db.refresh(paper)

    return paper_response(paper)


@router.get("/{paper_id}")
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    return paper_response(paper)


@router.put("/{paper_id}")
def update_paper(
    paper_id: int,
    payload: PaperUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    for key, value in payload.model_dump(
        exclude_unset=True
    ).items():
        setattr(paper, key, value)

    db.commit()
    db.refresh(paper)

    return paper_response(paper)


@router.delete("/{paper_id}")
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    db.delete(paper)
    db.commit()

    return {
        "message": "Paper deleted"
    }


# ============================================================
# PAPER ↔ CONFERENCE
# ============================================================

@router.get("/{paper_id}/conferences")
def get_paper_conferences(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    return [
        conference_response(conference)
        for conference in paper.conferences
    ]


@router.post("/{paper_id}/conferences/{conference_id}")
def attach_conference_to_paper(
    paper_id: int,
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    conference = get_owned_conference(
        conference_id,
        db,
        current_user.id,
    )

    # Avoid duplicate association
    if conference in paper.conferences:
        return {
            "message": "Conference is already associated with this paper",
            "conference": conference_response(conference),
        }

    paper.conferences.append(conference)

    db.commit()
    db.refresh(paper)

    return {
        "message": "Conference associated with paper",
        "conference": conference_response(conference),
    }


@router.delete("/{paper_id}/conferences/{conference_id}")
def detach_conference_from_paper(
    paper_id: int,
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    paper = get_owned_paper(
        paper_id,
        db,
        current_user.id,
    )

    conference = get_owned_conference(
        conference_id,
        db,
        current_user.id,
    )

    if conference not in paper.conferences:
        raise HTTPException(
            status_code=404,
            detail="Conference is not associated with this paper",
        )

    paper.conferences.remove(conference)

    db.commit()

    return {
        "message": "Conference removed from paper"
    }