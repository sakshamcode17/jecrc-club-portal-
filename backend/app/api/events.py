from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime
import os
import uuid

from app.db.session import get_db
from app.models.models import Event, Club, User
from app.schemas.event import Event as EventSchema, EventCreate, EventUpdate, EventWithClub
from app.api.deps import get_current_admin_user, get_current_active_user

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "events")
ALLOWED_BANNER_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_BANNER_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[EventWithClub])
async def list_events(
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[str] = None,
    club_id: Optional[int] = None,
    search: Optional[str] = None,
):
    """List all events with optional filtering."""
    query = select(Event).options(joinedload(Event.club)).order_by(Event.date.asc())
    
    now = datetime.utcnow()
    
    # Apply filters
    filters = []
    if status_filter:
        if status_filter.lower() == "upcoming":
            filters.append(Event.date > now)
        elif status_filter.lower() == "past":
            filters.append(Event.date < now)
        # Ongoing could be defined as date is today or within a range, 
        # but for simplicity let's stick to simple comparison or the status field
        elif status_filter.lower() == "ongoing":
            # For now, let's say ongoing is same day or specific status
            filters.append(Event.status == "Ongoing")
        else:
            filters.append(Event.status == status_filter)
            
    if club_id:
        filters.append(Event.organizer_club_id == club_id)
        
    if search:
        filters.append(or_(
            Event.title.ilike(f"%{search}%"),
            Event.description.ilike(f"%{search}%"),
            Event.location.ilike(f"%{search}%")
        ))
        
    if filters:
        query = query.where(and_(*filters))
        
    result = await db.execute(query)
    events = result.unique().scalars().all()
    
    response = []
    for event in events:
        event_dict = EventWithClub.model_validate(event)
        event_dict.club_name = event.club.name if event.club else "Unknown"
        response.append(event_dict)
        
    return response

@router.post("/upload-banner", response_model=dict)
@router.post("/upload-banner/", response_model=dict, include_in_schema=False)
async def upload_event_banner(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin_user)
):
    """Upload an event banner (Admin only)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_BANNER_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use JPG, PNG, or WEBP."
        )

    if file.content_type not in ALLOWED_BANNER_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported content type. Use image/jpeg, image/png, or image/webp."
        )

    content = await file.read()
    if len(content) > MAX_BANNER_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Banner exceeds 5MB size limit.")

    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {"banner_url": f"/uploads/events/{filename}"}

@router.get("/{event_id}", response_model=EventWithClub)
async def get_event(
    event_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific event by ID."""
    result = await db.execute(
        select(Event).options(joinedload(Event.club)).where(Event.id == event_id)
    )
    event = result.unique().scalars().first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event_dict = EventWithClub.model_validate(event)
    event_dict.club_name = event.club.name if event.club else "Unknown"
    return event_dict

@router.post("/", response_model=EventSchema, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Create a new event (Admin only)."""
    db_event = Event(**event_in.model_dump())
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=EventSchema)
async def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update an event (Admin only)."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    db_event = result.scalars().first()
    
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
        
    await db.commit()
    await db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete an event (Admin only)."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    db_event = result.scalars().first()
    
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    await db.delete(db_event)
    await db.commit()
    return None
