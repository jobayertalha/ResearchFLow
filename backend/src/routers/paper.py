from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Paper
from ..schemas import PaperCreate, PaperUpdate
from ..security import auth

router = APIRouter(prefix="/papers", tags=["Papers"])


def get_owned_paper(paper_id: int, db: Session, user_id: int) -> Paper:
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.user_id == user_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


def paper_response(paper: Paper):
    total = len(paper.tasks)
    completed = sum(1 for task in paper.tasks if task.completed)
    progress = round((completed / total) * 100) if total else 0

    days_left = None
    if paper.deadline:
        days_left = (paper.deadline - date.today()).days

    return {
        "id": paper.id,
        "title": paper.title,
        "research_field": paper.research_field,
        "description": paper.description,
        "conference_name": paper.conference_name,
        "conference_url": paper.conference_url,
        "deadline": paper.deadline,
        "status": paper.status,
        "created_at": paper.created_at,
        "completed_at": paper.completed_at,
        "total_tasks": total,
        "completed_tasks": completed,
        "progress": progress,
        "days_left": days_left,
    }


@router.get("")
def get_papers(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    papers = db.query(Paper).filter(Paper.user_id == current_user.id).order_by(Paper.created_at.desc()).all()
    return [paper_response(paper) for paper in papers]


@router.post("")
def create_paper(payload: PaperCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    paper = Paper(**payload.model_dump(), user_id=current_user.id)
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper_response(paper)


@router.get("/{paper_id}")
def get_paper(paper_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return paper_response(get_owned_paper(paper_id, db, current_user.id))


@router.put("/{paper_id}")
def update_paper(paper_id: int, payload: PaperUpdate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    paper = get_owned_paper(paper_id, db, current_user.id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(paper, key, value)
    db.commit()
    db.refresh(paper)
    return paper_response(paper)


@router.delete("/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    paper = get_owned_paper(paper_id, db, current_user.id)
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted"}
