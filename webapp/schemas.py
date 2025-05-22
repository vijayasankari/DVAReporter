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
