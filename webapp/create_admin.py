import os
from sqlalchemy.orm import Session
from webapp.database import SessionLocal
from webapp import models
from passlib.context import CryptContext

# Set up password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db: Session = SessionLocal()

    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    role = "admin"

    hashed_password = pwd_context.hash(password)

    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        print(f"⚠️  Admin user '{username}' already exists.")
        return

    new_user = models.User(
        username=username,
        hashed_password=hashed_password,
        role=role
    )
    db.add(new_user)
    db.commit()
    print(f"✅ Admin user '{username}' created successfully.")

if __name__ == "__main__":
    create_admin_user()
