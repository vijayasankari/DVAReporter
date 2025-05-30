from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from webapp.routers import vulnerabilities, report, logo, evidences, auth

app = FastAPI()  # ✅ Must be defined BEFORE include_router

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend dev origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include all routers
app.include_router(auth.router)
app.include_router(vulnerabilities.router)
app.include_router(report.router)
app.include_router(logo.router)
app.include_router(evidences.router)

# ✅ Serve static files (e.g., uploaded images)
app.mount("/uploaded_evidence", StaticFiles(directory="uploaded_evidence"), name="uploaded_evidence")
