from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.models.models import Club
from app.schemas.club import Club as ClubSchema

router = APIRouter()

@router.get("/", response_model=List[ClubSchema])
async def get_clubs(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Club).options(
        selectinload(Club.projects),
        selectinload(Club.leadership),
    )
    if category and category != "All":
        query = query.where(Club.category == category)
    
    result = await db.execute(query)
    return result.scalars().unique().all()

@router.get("/{slug}", response_model=ClubSchema)
async def get_club_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Club)
        .where(Club.slug == slug)
        .options(
            selectinload(Club.projects),
            selectinload(Club.leadership),
        )
    )
    club = result.scalars().first()
    
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    return club
