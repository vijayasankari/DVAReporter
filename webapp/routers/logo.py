from fastapi import APIRouter, UploadFile, File
import shutil
import os

router = APIRouter(prefix="/logo", tags=["Logo"])

UPLOAD_DIR = "uploaded_logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_logo(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, "logo.png")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "Logo uploaded successfully", "filename": file.filename}
