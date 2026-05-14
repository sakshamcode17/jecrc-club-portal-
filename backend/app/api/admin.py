from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import re
import os
import uuid

from app.core.security import get_password_hash
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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLUB_LOGO_UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "clubs")
ALLOWED_LOGO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_LOGO_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024

if not os.path.exists(CLUB_LOGO_UPLOAD_DIR):
    os.makedirs(CLUB_LOGO_UPLOAD_DIR, exist_ok=True)


class ApplicationStatusUpdate(BaseModel):
    status: str


class BulkApplicationStatusUpdate(BaseModel):
    application_ids: List[int]
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


class StudentBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    enrollment_no: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    contact: Optional[str] = None
    is_active: bool = True


class StudentUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    enrollment_no: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    contact: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    enrollment_no: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    contact: Optional[str] = None
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class StudentCreateResponse(BaseModel):
    student: StudentResponse
    generated_username: str
    login_identifier: str
    generated_password: str


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


def _generate_default_password(email: str) -> str:
    local_part = email.split("@")[0].strip().lower()
    name_match = re.match(r"[a-z]+", local_part)
    name_part = name_match.group(0) if name_match else "student"

    year_match = re.search(r"(\d{4})(?!.*\d)", local_part)
    if year_match:
        year_part = year_match.group(1)
    else:
        digits = "".join(ch for ch in local_part if ch.isdigit())
        year_part = digits[-4:] if len(digits) >= 4 else "2024"

    return f"{name_part}@{year_part}"


def _student_model_to_response(student: User) -> StudentResponse:
    return StudentResponse(
        id=student.id,
        email=student.email,
        full_name=student.full_name,
        enrollment_no=student.enrollment_no,
        branch=student.branch,
        semester=student.semester,
        contact=student.contact,
        is_active=student.is_active,
        is_admin=student.is_admin,
    )


def _generate_username_hint(email: str, enrollment_no: Optional[str]) -> str:
    if enrollment_no and enrollment_no.strip():
        return enrollment_no.strip()
    return email.split("@")[0].strip() if "@" in email else email


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


@router.put("/applications/bulk-status")
async def admin_bulk_update_application_status(
    update_in: BulkApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    valid_statuses = ["Pending", "Under Review", "Interview Scheduled", "Accepted", "Rejected"]
    if update_in.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )
    if not update_in.application_ids:
        raise HTTPException(status_code=400, detail="No applications selected")

    result = await db.execute(
        select(Application).where(Application.id.in_(update_in.application_ids))
    )
    apps = result.scalars().all()
    if not apps:
        raise HTTPException(status_code=404, detail="Applications not found")

    now = datetime.utcnow()
    for app in apps:
        app.status = update_in.status
        app.updated_at = now

    await db.commit()
    return {"updated_count": len(apps), "status": update_in.status}


@router.get("/students", response_model=List[StudentResponse])
async def admin_list_students(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    search: Optional[str] = None,
    branch: Optional[str] = None,
    semester: Optional[str] = None,
    is_active: Optional[bool] = None,
):
    query = select(User).where(User.is_admin.is_(False)).order_by(User.id.desc())

    if search and search.strip():
        search_value = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_value),
                User.email.ilike(search_value),
                User.enrollment_no.ilike(search_value),
                User.branch.ilike(search_value),
                User.semester.ilike(search_value),
                User.contact.ilike(search_value),
            )
        )

    if branch and branch.strip():
        query = query.where(User.branch == branch.strip())
    if semester and semester.strip():
        query = query.where(User.semester == semester.strip())
    if is_active is not None:
        query = query.where(User.is_active.is_(is_active))

    result = await db.execute(query)
    students = result.scalars().all()
    return [_student_model_to_response(student) for student in students]


@router.get("/students/{student_id}", response_model=StudentResponse)
async def admin_get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.id == student_id, User.is_admin.is_(False)))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_model_to_response(student)


@router.post("/students", response_model=StudentCreateResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_student(
    student_in: StudentBase,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    email = student_in.email.strip().lower()
    enrollment_no = student_in.enrollment_no.strip() if student_in.enrollment_no else None

    existing_email = await db.execute(select(User).where(User.email == email))
    if existing_email.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    if enrollment_no:
        existing_enrollment = await db.execute(select(User).where(User.enrollment_no == enrollment_no))
        if existing_enrollment.scalars().first():
            raise HTTPException(status_code=400, detail="User with this enrollment number already exists")

    generated_password = _generate_default_password(email)
    student = User(
        email=email,
        hashed_password=get_password_hash(generated_password),
        full_name=student_in.full_name,
        enrollment_no=enrollment_no,
        branch=student_in.branch,
        semester=student_in.semester,
        contact=student_in.contact,
        is_active=student_in.is_active,
        is_admin=False,
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)

    generated_username = _generate_username_hint(email=email, enrollment_no=enrollment_no)
    return StudentCreateResponse(
        student=_student_model_to_response(student),
        generated_username=generated_username,
        login_identifier=email,
        generated_password=generated_password,
    )


@router.put("/students/{student_id}", response_model=StudentResponse)
async def admin_update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.id == student_id, User.is_admin.is_(False)))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_in.model_dump(exclude_unset=True)

    if "email" in update_data:
        new_email = update_data["email"].strip().lower()
        existing_email = await db.execute(select(User).where(User.email == new_email, User.id != student.id))
        if existing_email.scalars().first():
            raise HTTPException(status_code=400, detail="User with this email already exists")
        student.email = new_email

    if "enrollment_no" in update_data:
        enrollment_no = update_data["enrollment_no"].strip() if update_data["enrollment_no"] else None
        if enrollment_no:
            existing_enrollment = await db.execute(
                select(User).where(User.enrollment_no == enrollment_no, User.id != student.id)
            )
            if existing_enrollment.scalars().first():
                raise HTTPException(status_code=400, detail="User with this enrollment number already exists")
        student.enrollment_no = enrollment_no

    if "password" in update_data and update_data["password"]:
        student.hashed_password = get_password_hash(update_data["password"])

    for field in ["full_name", "branch", "semester", "contact", "is_active"]:
        if field in update_data:
            setattr(student, field, update_data[field])

    await db.commit()
    await db.refresh(student)
    return _student_model_to_response(student)


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.id == student_id, User.is_admin.is_(False)))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    await db.delete(student)
    await db.commit()
    return None


@router.post("/clubs/upload-logo", response_model=dict)
@router.post("/clubs/upload-logo/", response_model=dict, include_in_schema=False)
async def admin_upload_club_logo(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_LOGO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use JPG, PNG, or WEBP.",
        )

    if file.content_type not in ALLOWED_LOGO_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported content type. Use image/jpeg, image/png, or image/webp.",
        )

    content = await file.read()
    if len(content) > MAX_LOGO_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Logo exceeds 5MB size limit.")

    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(CLUB_LOGO_UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {"logo_url": f"/uploads/clubs/{filename}"}


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
