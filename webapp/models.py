from sqlalchemy import Column, Integer, String, Text
from webapp.database import Base


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True)
    severity = Column(String)
    cvss_score = Column(String)
    cvss_vector = Column(String)
    description = Column(Text)
    evidence = Column(Text)
    recommendation = Column(Text)
    reference = Column(Text)
