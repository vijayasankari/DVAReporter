from sqlalchemy.orm import Session
from webapp import models, schemas
from webapp.routers import vulnerabilities, report
from webapp.database import engine, Base


def get_vulnerabilities(db: Session):
    return db.query(models.Vulnerability).all()

def get_vulnerability(db: Session, vuln_id: int):
    return db.query(models.Vulnerability).filter(models.Vulnerability.id == vuln_id).first()

def create_vulnerability(db: Session, vuln: schemas.VulnerabilityCreate):
    db_vuln = models.Vulnerability(**vuln.dict())
    db.add(db_vuln)
    db.commit()
    db.refresh(db_vuln)
    return db_vuln
