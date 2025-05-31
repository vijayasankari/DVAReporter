# webapp/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from webapp.database import get_db
from webapp import models
from webapp.auth_utils import auto_register_okta_user
from webapp.schemas import TokenRequest

router = APIRouter(prefix="/auth", tags=["auth"])

# Environment secret key (use a secure one in prod)
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Request schema
class LoginRequest(BaseModel):
    username: str
    password: str


# Response schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token")
def login(request: TokenRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=request.username).first()

    # If not found, try Okta-based auto registration
    if not user:
        # You can fetch group from an external header or SSO data
        group = request.okta_group if hasattr(request, 'okta_group') else "DefaultGroup"
        user = auto_register_okta_user(request.username, group, db)

    if not user:
        raise HTTPException(status_code=403, detail="Invalid credentials or group not mapped")

    if not user.is_okta:
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_token(user.username, user.role)
    return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username}