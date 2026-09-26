from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserLogin
from ..security import auth

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/login")
def user_login(user: UserLogin, db: Session = Depends(get_db)):
    name = user.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    existing = db.query(User).filter(User.name == name).first()
    if not existing:
        existing = User(name=name)
        db.add(existing)
        db.commit()
        db.refresh(existing)

    token = auth.create_access_token({"sub": existing.name})
    return {"token": token, "token_type": "bearer", "user": {"id": existing.id, "name": existing.name}}
