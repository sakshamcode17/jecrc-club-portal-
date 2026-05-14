from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import re

from app.db.session import get_db
from app.models.models import Application, Club, ClubLeader, Directory, Project, User
from app.api.deps import get_current_admin_user
from app.schemas.club import Club as ClubSchema, ClubCreate, ClubUpdate
from app.schemas.directory import (
    Directory as DirectorySchema,
    DirectoryCreate,
    DirectoryUpdate,
)

router = APIRouter()


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationDetail(BaseModel):
    id: int
    user_id: int
    club_id: int
    position: str
    motivation: Optional[str] = None
    skills: Optional[str] = None
    portfolio_link: Optional[str] = None
    resume_url: Optional[str] = None
    availability: Optional[str] = None
    contact_number: Optional[str] = None
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_enrollment: Optional[str] = None
    student_branch: Optional[str] = None
    club_name: Optional[str] = None

    class Config:
        from_attributes = True


class RecruitmentStatusUpdate(BaseModel):
    is_accepting: bool


def _slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or "club"


async def _load_club_or_404(db: AsyncSession, club_id: int) -> Club:
    result = await db.execute(
        select(Club)
        .options(selectinload(Club.projects), selectinload(Club.leadership))
        .where(Club.id == club_id)
    )
    club = result.scalars().first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.get("/applications", response_model=List[ApplicationDetail])
async def admin_list_applications(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    status_filter: Optional[str] = None,
    club_id: Optional[int] = None,
):
    query = (
        select(Application)
        .options(joinedload(Application.user), joinedload(Application.club))
        .order_by(Application.applied_at.desc())
    )

    if status_filter:
        query = query.where(Application.status == status_filter)
    if club_id:
        query = query.where(Application.club_id == club_id)

    result = await db.execute(query)
    apps = result.unique().scalars().all()

    response: List[ApplicationDetail] = []
    for app in apps:
        response.append(
            ApplicationDetail(
                id=app.id,
                user_id=app.user_id,
                club_id=app.club_id,
                position=app.position,
                motivation=app.motivation,
                skills=app.skills,
                portfolio_link=app.portfolio_link,
                resume_url=app.resume_url,
                availability=app.availability,
                contact_number=app.contact_number,
                status=app.status,
                applied_at=app.applied_at,
                updated_at=app.updated_at,
                student_name=app.user.full_name if app.user else None,
                student_email=app.user.email if app.user else None,
                student_enrollment=app.user.enrollment_no if app.user else None,
                student_branch=app.user.branch if app.user else None,
                club_name=app.club.name if app.club else None,
            )
        )
    return response


@router.put("/applications/{application_id}/status", response_model=ApplicationDetail)
async def admin_update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    valid_statuses = ["Pending", "Under Review", "Interview Scheduled", "Accepted", "Rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    result = await db.execute(
        select(Application)
        .options(joinedload(Application.user), joinedload(Application.club))
        .where(Application.id == application_id)
    )
    app = result.unique().scalars().first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = status_update.status
    app.updated_at = datetime.utcnow()
    await db.commit()

    result = await db.execute(
        select(Application)
        .options(joinedload(Application.user), joinedload(Application.club))
        .where(Application.id == application_id)
    )
    app = result.unique().scalars().first()

    return ApplicationDetail(
        id=app.id,
        user_id=app.user_id,
        club_id=app.club_id,
        position=app.position,
        motivation=app.motivation,
        skills=app.skills,
        portfolio_link=app.portfolio_link,
        resume_url=app.resume_url,
        availability=app.availability,
        contact_number=app.contact_number,
        status=app.status,
        applied_at=app.applied_at,
        updated_at=app.updated_at,
        student_name=app.user.full_name if app.user else None,
        student_email=app.user.email if app.user else None,
        student_enrollment=app.user.enrollment_no if app.user else None,
        student_branch=app.user.branch if app.user else None,
        club_name=app.club.name if app.club else None,
    )


@router.get("/clubs", response_model=List[ClubSchema])
async def admin_list_clubs(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(
        select(Club)
        .options(selectinload(Club.projects), selectinload(Club.leadership))
        .order_by(Club.name.asc())
    )
    return result.scalars().unique().all()


@router.post("/clubs", response_model=ClubSchema, status_code=status.HTTP_201_CREATED)
async def admin_create_club(
    club_in: ClubCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    payload = club_in.model_dump()
    projects_data = payload.pop("projects", [])
    leadership_data = payload.pop("leadership", [])

    slug = payload.get("slug") or _slugify(payload["name"])
    payload["slug"] = slug

    duplicate = await db.execute(select(Club).where(or_(Club.name == payload["name"], Club.slug == slug)))
    if duplicate.scalars().first():
        raise HTTPException(status_code=400, detail="Club with same name or slug already exists")

    club = Club(**payload)
    club.projects = [Project(**item) for item in projects_data]
    club.leadership = [ClubLeader(**item) for item in leadership_data]

    db.add(club)
    await db.commit()

    return await _load_club_or_404(db, club.id)


@router.put("/clubs/{club_id}", response_model=ClubSchema)
async def admin_update_club(
    club_id: int,
    club_in: ClubUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    club = await _load_club_or_404(db, club_id)
    update_data = club_in.model_dump(exclude_unset=True)

    projects_data = update_data.pop("projects", None)
    leadership_data = update_data.pop("leadership", None)

    if "name" in update_data and update_data["name"] != club.name:
        duplicate_name = await db.execute(select(Club).where(Club.name == update_data["name"], Club.id != club.id))
        if duplicate_name.scalars().first():
            raise HTTPException(status_code=400, detail="Club name already exists")

    if "slug" in update_data:
        raw_slug = (update_data.pop("slug") or "").strip()
        new_slug = raw_slug or _slugify(update_data.get("name", club.name))
        if new_slug != club.slug:
            duplicate_slug = await db.execute(select(Club).where(Club.slug == new_slug, Club.id != club.id))
            if duplicate_slug.scalars().first():
                raise HTTPException(status_code=400, detail="Club slug already exists")
        club.slug = new_slug

    for field, value in update_data.items():
        setattr(club, field, value)

    if projects_data is not None:
        club.projects = [Project(**item) for item in projects_data]

    if leadership_data is not None:
        club.leadership = [ClubLeader(**item) for item in leadership_data]

    await db.commit()
    return await _load_club_or_404(db, club.id)


@router.put("/clubs/{club_id}/recruitment", response_model=ClubSchema)
async def admin_update_club_recruitment(
    club_id: int,
    recruitment_in: RecruitmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    club = await _load_club_or_404(db, club_id)
    club.is_accepting = recruitment_in.is_accepting
    await db.commit()
    return await _load_club_or_404(db, club.id)


@router.put("/recruitment/{club_id}", response_model=ClubSchema)
async def admin_update_recruitment_legacy(
    club_id: int,
    recruitment_in: RecruitmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    return await admin_update_club_recruitment(club_id, recruitment_in, db, current_admin)


@router.delete("/clubs/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_club(
    club_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    club = await _load_club_or_404(db, club_id)
    await db.delete(club)
    await db.commit()
    return None


@router.get("/directory", response_model=List[DirectorySchema])
async def admin_list_directory(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    search: Optional[str] = None,
    club_id: Optional[int] = None,
):
    query = (
        select(Directory)
        .outerjoin(Directory.club)
        .options(joinedload(Directory.club))
        .order_by(Directory.name.asc())
    )

    if search:
        search_value = f"%{search.strip()}%"
        query = query.where(
            or_(
                Directory.name.ilike(search_value),
                Directory.designation.ilike(search_value),
                Directory.role.ilike(search_value),
                Directory.phone.ilike(search_value),
                Directory.email.ilike(search_value),
                Club.name.ilike(search_value),
            )
        )

    if club_id:
        query = query.where(Directory.club_id == club_id)

    result = await db.execute(query)
    return result.unique().scalars().all()


@router.post("/directory", response_model=DirectorySchema, status_code=status.HTTP_201_CREATED)
async def admin_create_directory_entry(
    entry_in: DirectoryCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    if entry_in.club_id is not None:
        club_result = await db.execute(select(Club).where(Club.id == entry_in.club_id))
        club = club_result.scalars().first()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")

    db_entry = Directory(**entry_in.model_dump())
    db.add(db_entry)
    await db.commit()

    result = await db.execute(
        select(Directory)
        .options(joinedload(Directory.club))
        .where(Directory.id == db_entry.id)
    )
    return result.unique().scalars().first()


@router.put("/directory/{entry_id}", response_model=DirectorySchema)
async def admin_update_directory_entry(
    entry_id: int,
    entry_in: DirectoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(Directory).where(Directory.id == entry_id))
    db_entry = result.scalars().first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Directory entry not found")

    update_data = entry_in.model_dump(exclude_unset=True)

    if update_data.get("club_id") is not None:
        club_result = await db.execute(select(Club).where(Club.id == update_data["club_id"]))
        club = club_result.scalars().first()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")

    for field, value in update_data.items():
        setattr(db_entry, field, value)

    await db.commit()

    result = await db.execute(
        select(Directory)
        .options(joinedload(Directory.club))
        .where(Directory.id == entry_id)
    )
    return result.unique().scalars().first()


@router.delete("/directory/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_directory_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(Directory).where(Directory.id == entry_id))
    db_entry = result.scalars().first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Directory entry not found")

    await db.delete(db_entry)
    await db.commit()
    return None
