from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import User, Application
from app.schemas.user import User as UserSchema, UserUpdate
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Calculate active clubs count from accepted applications
    query = select(Application).where(
        Application.user_id == current_user.id,
        Application.status == "Accepted"
    )
    result = await db.execute(query)
    accepted_apps = result.scalars().all()
    
    current_user.active_clubs_count = len(accepted_apps)
    current_user.events_attended_count = 0 # Default as per requirements
    
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.branch is not None:
        current_user.branch = user_in.branch
    if user_in.semester is not None:
        current_user.semester = user_in.semester
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
