from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from webapp.routers import vulnerabilities, report, logo, evidences
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# ✅ CORS must be applied BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers
app.include_router(vulnerabilities.router)
app.include_router(report.router)
app.include_router(logo.router)
app.include_router(evidences.router)

# ✅ Static path for uploaded images
app.mount("/uploaded_evidence", StaticFiles(directory="uploaded_evidence"), name="uploaded_evidence")
