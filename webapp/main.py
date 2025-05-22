from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from webapp.routers import vulnerabilities, report, logo
from webapp.routers import evidences
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers AFTER defining app
app.include_router(vulnerabilities.router)
app.include_router(report.router)
app.include_router(logo.router)

app.include_router(evidences.router)

# Mount static directory for serving uploaded evidence images
app.mount("/uploaded_evidence", StaticFiles(directory="uploaded_evidence"), name="uploaded_evidence")