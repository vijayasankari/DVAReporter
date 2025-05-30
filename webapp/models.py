from sqlalchemy import Column, Integer, String, Text, Boolean
from webapp.database import Base


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True)  # ✅ FIXED LENGTH
    severity = Column(String(50))
    cvss_score = Column(String(50))
    cvss_vector = Column(String(255))
    description = Column(Text)
    evidence = Column(Text)
    recommendation = Column(Text)
    reference = Column(Text)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(50))