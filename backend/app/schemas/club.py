from pydantic import BaseModel
from typing import List, Optional

class ProjectBase(BaseModel):
    title: str
    description: str
    date: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    club_id: int

    class Config:
        from_attributes = True

class ClubBase(BaseModel):
    name: str
    slug: str
    category: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_accepting: bool = True

class ClubCreate(ClubBase):
    pass

class Club(ClubBase):
    id: int
    projects: List[Project] = []

    class Config:
        from_attributes = True

class ClubBrief(BaseModel):
    """Lightweight club schema with no nested relationships - safe to use inside Application responses."""
    id: int
    name: str
    slug: str
    category: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True
