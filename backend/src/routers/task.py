from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Paper, Task
from ..schemas import TaskCreate, TaskUpdate
from ..security import auth

router = APIRouter(prefix="/papers/{paper_id}/tasks", tags=["Research Tasks"])


def get_owned_paper(paper_id: int, db: Session, user_id: int) -> Paper:
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.user_id == user_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


def get_owned_task(task_id: int, paper_id: int, db: Session, user_id: int) -> Task:
    task = (
        db.query(Task)
        .join(Paper)
        .filter(Task.id == task_id, Task.paper_id == paper_id, Paper.user_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("")
def get_tasks(paper_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    get_owned_paper(paper_id, db, current_user.id)
    return db.query(Task).filter(Task.paper_id == paper_id).order_by(Task.position, Task.id).all()


@router.post("")
def create_task(paper_id: int, payload: TaskCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    get_owned_paper(paper_id, db, current_user.id)
    last = db.query(Task).filter(Task.paper_id == paper_id).order_by(Task.position.desc()).first()
    position = (last.position + 1) if last else 0
    task = Task(**payload.model_dump(), paper_id=paper_id, position=position)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}")
def update_task(paper_id: int, task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    task = get_owned_task(task_id, paper_id, db, current_user.id)
    for key, value in payload.model_dump().items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(paper_id: int, task_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    task = get_owned_task(task_id, paper_id, db, current_user.id)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
