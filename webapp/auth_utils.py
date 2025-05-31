# webapp/auth_utils.py (or auth.py depending on your structure)
from sqlalchemy.orm import Session
from fastapi import Depends
from . import models
from .database import get_db

def auto_register_okta_user(username: str, group: str, db: Session):
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        return user

    # Find if group is preconfigured
    existing_group = db.query(models.User).filter_by(is_okta=True, okta_group=group).first()
    if not existing_group:
        return None  # Deny access if group is not pre-mapped

    new_user = models.User(
        username=username,
        hashed_password="",
        role=existing_group.role,
        is_okta=True,
        okta_group=group
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
