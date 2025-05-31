from pydantic import BaseModel
from typing import Optional

# ----------------------
# Vulnerability Schemas
# ----------------------
class VulnerabilityBase(BaseModel):
    title: str
    severity: str
    cvss_score: str
    cvss_vector: str
    description: str
    evidence: str
    recommendation: str
    reference: str

class VulnerabilityCreate(VulnerabilityBase):
    pass

class Vulnerability(VulnerabilityBase):
    id: int

    class Config:
        from_attributes = True  # For Pydantic v2


# ----------------------
# User Schemas
# ----------------------
class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    is_okta: bool = False
    okta_group: str = ""

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_okta: bool
    okta_group: str

    class Config:
        from_attributes = True


# ----------------------
# DB Configuration Schema
# ----------------------
class DBConfig(BaseModel):
    db_type: str
    host: str
    port: int
    db_name: str
    user: str
    password: str


# ----------------------
# Login Request Schema
# ----------------------
class TokenRequest(BaseModel):
    username: str
    password: Optional[str] = None  # Allow blank for Okta users
    okta_group: Optional[str] = None
