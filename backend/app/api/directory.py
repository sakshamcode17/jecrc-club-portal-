from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.db.session import get_db
from app.models.models import Club, Directory
from app.schemas.directory import Directory as DirectorySchema

router = APIRouter()


@router.get("/", response_model=List[DirectorySchema])
async def list_directory(
    search: Optional[str] = None,
    club_id: Optional[int] = None,
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
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

    if role:
        query = query.where(Directory.role == role)

    result = await db.execute(query)
    return result.unique().scalars().all()
