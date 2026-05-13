from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    banner: Optional[str] = None
    date: datetime
    location: Optional[str] = None
    organizer_club_id: Optional[int] = None
    registration_link: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    status: Optional[str] = "Upcoming"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    banner: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    organizer_club_id: Optional[int] = None
    registration_link: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    status: Optional[str] = None

class Event(EventBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class EventWithClub(Event):
    club_name: Optional[str] = None
