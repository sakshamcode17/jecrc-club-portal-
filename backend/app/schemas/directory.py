from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class DirectoryClub(BaseModel):
    id: int
    name: str
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DirectoryBase(BaseModel):
    name: str
    designation: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    club_id: Optional[int] = None


class DirectoryCreate(DirectoryBase):
    pass


class DirectoryUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    club_id: Optional[int] = None


class Directory(DirectoryBase):
    id: int
    club: Optional[DirectoryClub] = None

    model_config = ConfigDict(from_attributes=True)
