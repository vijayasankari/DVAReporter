from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from webapp import crud, schemas, models
from webapp.database import SessionLocal
from fastapi.responses import FileResponse
from io import BytesIO
import pandas as pd
import os

router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.Vulnerability])
def read_vulnerabilities(db: Session = Depends(get_db)):
    return crud.get_vulnerabilities(db)

@router.get("/{vuln_id}", response_model=schemas.Vulnerability)
def read_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    vuln = crud.get_vulnerability(db, vuln_id)
    if vuln is None:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vuln

@router.post("/", response_model=schemas.Vulnerability)
def create_vulnerability(vuln: schemas.VulnerabilityCreate, db: Session = Depends(get_db)):
    return crud.create_vulnerability(db, vuln)

@router.put("/{vuln_id}/", response_model=schemas.Vulnerability)
def update_vulnerability(vuln_id: int, updated: schemas.VulnerabilityCreate, db: Session = Depends(get_db)):
    vuln = db.query(models.Vulnerability).filter(models.Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    for field, value in updated.dict().items():
        setattr(vuln, field, value)

    db.commit()
    db.refresh(vuln)
    return vuln

@router.delete("/{vuln_id}")
def delete_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    vuln = db.query(models.Vulnerability).filter(models.Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    db.delete(vuln)
    db.commit()
    return {"message": "Deleted successfully"}


@router.post("/upload_excel/")
async def upload_vulnerabilities(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        required_columns = ['title', 'severity', 'description', 'recommendation', 'reference']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing column: {col}")

        inserted = 0
        updated = 0
        skipped = 0

        for idx, row in df.iterrows():
            try:
                title = str(row["title"]).strip()
                severity = str(row["severity"]).strip()
                description = str(row.get("description", "")).strip()
                recommendation = str(row.get("recommendation", "")).strip()
                reference = str(row.get("reference", "")).strip()

                if not title or not severity:
                    skipped += 1
                    continue

                existing = db.query(models.Vulnerability).filter(
                    models.Vulnerability.title.ilike(title)
                ).first()

                if existing:
                    if (
                        existing.severity != severity or
                        existing.description != description or
                        existing.recommendation != recommendation or
                        existing.reference != reference
                    ):
                        existing.severity = severity
                        existing.description = description
                        existing.recommendation = recommendation
                        existing.reference = reference
                        db.add(existing)
                        updated += 1
                    else:
                        skipped += 1
                else:
                    vuln = models.Vulnerability(
                        title=title,
                        severity=severity,
                        cvss_score="",
                        cvss_vector="",
                        description=description,
                        evidence="",
                        recommendation=recommendation,
                        reference=reference
                    )
                    db.add(vuln)
                    inserted += 1

            except Exception as row_error:
                print(f"❌ Error processing row {idx}: {row_error}")
                skipped += 1

        db.commit()
        return {
            "inserted": inserted,
            "updated": updated,
            "skipped": skipped,
            "message": f"✅ Upload complete. Inserted: {inserted}, Updated: {updated}, Skipped: {skipped}"
        }

    except Exception as e:
        import traceback
        print("Upload Excel Error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"❌ Error processing file: {str(e)}")


@router.get("/sample_excel/")
def download_sample_excel():
    sample_path = os.path.join("webapp", "static", "vulnerability_upload_template.xlsx")
    return FileResponse(path=sample_path, filename="vulnerability_upload_template.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
