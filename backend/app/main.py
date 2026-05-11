from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.clubs import router as clubs_router
from app.api.users import router as users_router
from app.api.applications import router as applications_router
from app.api.admin import router as admin_router

app = FastAPI(
    title="JECRC Club Hub API",
    description="Backend API for JECRC University Student Club Portal",
    version="1.0.0"
)

# Static files for uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(clubs_router, prefix="/api/clubs", tags=["Clubs"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to JECRC Club Hub API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
