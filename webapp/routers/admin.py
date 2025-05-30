# webapp/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from webapp import models, schemas, database, auth_utils
from typing import List
from webapp.dependencies import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users/", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(database.get_db), user: models.User = Depends(get_current_admin_user)):
    return db.query(models.User).all()


@router.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = auth_utils.get_password_hash(user.password)
    new_user = models.User(username=user.username, password=hashed_pw, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.post("/config/db/")
def configure_db(conn: schemas.DBConfig, current_user: models.User = Depends(get_current_admin_user)):
    # This is a placeholder. Actual implementation would involve saving connection info securely.
    return {"message": "DB configuration saved (simulated)", "config": conn.dict()}
