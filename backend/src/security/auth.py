from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        name = payload.get("sub")
        if not name:
            raise HTTPException(status_code=401, detail="Invalid token")
        return name
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    name = verify_token(token)
    user = db.query(User).filter(User.name == name).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
