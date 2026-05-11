import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import Application, User, Club
from app.schemas.application import Application as ApplicationSchema
from app.api.deps import get_current_active_user

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ApplicationSchema)
async def create_application(
    *,
    db: AsyncSession = Depends(get_db),
    club_id: int = Form(...),
    position: str = Form(...),
    motivation: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    portfolio_link: Optional[str] = Form(None),
    availability: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    # Check if club exists
    result = await db.execute(select(Club).where(Club.id == club_id))
    club = result.scalars().first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Check if user already applied
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .where(Application.club_id == club_id)
    )
    existing_app = result.scalars().first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this club")

    # Handle resume upload
    file_ext = resume.filename.split(".")[-1] if resume.filename else "pdf"
    file_name = f"resume_{current_user.id}_{club_id}_{int(datetime.utcnow().timestamp())}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)
    
    resume_url = f"/uploads/resumes/{file_name}"
    now = datetime.utcnow()

    db_app = Application(
        user_id=current_user.id,
        club_id=club_id,
        position=position,
        motivation=motivation or "",
        skills=skills or "",
        portfolio_link=portfolio_link,
        resume_url=resume_url,
        availability=availability or "",
        contact_number=contact_number or "",
        status="Pending",
        applied_at=now,
        updated_at=now,
    )
    db.add(db_app)
    await db.commit()
    await db.refresh(db_app)

    # Reload with club relationship
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Application)
        .options(joinedload(Application.club))
        .where(Application.id == db_app.id)
    )
    db_app = result.unique().scalars().first()
    return db_app

@router.get("/me", response_model=List[ApplicationSchema])
async def get_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Application)
        .options(joinedload(Application.club))
        .where(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
    )
    apps = result.unique().scalars().all()
    return apps
