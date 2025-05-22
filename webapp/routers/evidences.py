from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
import uuid
import mimetypes

router = APIRouter(prefix="/evidences", tags=["evidences"])

UPLOAD_DIR = "uploaded_evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/")
async def upload_evidence(file: UploadFile = File(...)):
    try:
        # Validate that the uploaded file is an image
        content_type = file.content_type
        if not content_type or not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")

        # Ensure file has a safe unique name
        ext = os.path.splitext(file.filename)[-1]
        safe_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"file_path": f"/{UPLOAD_DIR}/{safe_filename}"}

    except Exception as e:
        print(f"Image upload failed: {str(e)}")
        return JSONResponse(status_code=500, content={"error": f"Upload failed: {str(e)}"})
