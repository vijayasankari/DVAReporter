# webapp/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
from webapp import models, schemas, database
from webapp.auth import require_admin
from webapp.utils.db_config_handler import save_db_config, load_db_config

router = APIRouter(prefix="/admin", tags=["Admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/users/", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(database.get_db), current_user=Depends(require_admin)):
    return db.query(models.User).all()

@router.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user=Depends(require_admin)):
    if db.query(models.User).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = models.User(
        username=user.username,
        hashed_password=pwd_context.hash(user.password) if not user.is_okta else "",
        role=user.role,
        is_okta=user.is_okta,
        okta_group=user.okta_group or ""
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db), current_user=Depends(require_admin)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.post("/config/db/")
def configure_db(config: schemas.DBConfig, current_user=Depends(require_admin)):
    save_db_config(config.dict())
    return {"message": "DB configuration saved successfully"}

@router.get("/config/db/", response_model=schemas.DBConfig)
def get_db_config(current_user=Depends(require_admin)):
    cfg = load_db_config()
    if not cfg:
        raise HTTPException(status_code=404, detail="No DB config found")
    return cfg
