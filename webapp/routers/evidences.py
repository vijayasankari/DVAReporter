from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
import uuid
import mimetypes

router = APIRouter(prefix="/evidences", tags=["evidences"])

UPLOAD_DIR = "uploaded_evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/bmp"
}

@router.post("/upload/")
async def upload_evidence(file: UploadFile = File(...)):
    try:
        # Validate that the uploaded file is one of the allowed types
        content_type = file.content_type
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {content_type}. Allowed types: PNG, JPG, JPEG, GIF, BMP."
            )

        # Ensure file has a safe unique name
        ext = os.path.splitext(file.filename)[-1].lower()
        safe_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"file_path": f"/{UPLOAD_DIR}/{safe_filename}"}

    except Exception as e:
        print(f"Image upload failed: {str(e)}")
        return JSONResponse(status_code=500, content={"error": f"Upload failed: {str(e)}"})
