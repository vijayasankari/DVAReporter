from pydantic import BaseModel


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
        from_attributes = True  # Updated for Pydantic v2+

from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True
