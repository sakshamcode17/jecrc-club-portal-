from pydantic import BaseModel
from typing import List, Optional

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    club_id: int

    class Config:
        from_attributes = True


class ClubLeaderBase(BaseModel):
    name: str
    role: str
    email: Optional[str] = None


class ClubLeaderCreate(ClubLeaderBase):
    pass


class ClubLeader(ClubLeaderBase):
    id: int
    club_id: int

    class Config:
        from_attributes = True


class ClubBase(BaseModel):
    name: str
    slug: Optional[str] = None
    category: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_accepting: bool = True

class ClubCreate(ClubBase):
    projects: List[ProjectCreate] = []
    leadership: List[ClubLeaderCreate] = []


class ClubUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_accepting: Optional[bool] = None
    projects: Optional[List[ProjectCreate]] = None
    leadership: Optional[List[ClubLeaderCreate]] = None

class Club(ClubBase):
    id: int
    projects: List[Project] = []
    leadership: List[ClubLeader] = []

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
