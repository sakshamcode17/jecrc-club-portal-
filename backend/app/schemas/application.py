from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ApplicationBase(BaseModel):
    club_id: int
    position: str
    motivation: Optional[str] = None
    skills: Optional[str] = None
    portfolio_link: Optional[str] = None
    resume_url: Optional[str] = None
    availability: Optional[str] = None
    contact_number: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    position: Optional[str] = None

from .club import ClubBrief

class Application(ApplicationBase):
    id: int
    user_id: int
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None
    club: Optional[ClubBrief] = None

    class Config:
        from_attributes = True
