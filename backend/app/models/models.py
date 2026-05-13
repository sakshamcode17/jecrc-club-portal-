from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime, Text
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

# Association table for User <-> Club (Memberships)
club_members = Table(
    "club_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("club_id", Integer, ForeignKey("clubs.id"), primary_key=True),
    Column("role", String, default="Member"),
    Column("joined_at", DateTime, default=datetime.utcnow)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    enrollment_no = Column(String, unique=True)
    branch = Column(String)
    semester = Column(String)
    contact = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    clubs = relationship("Club", secondary=club_members, back_populates="members")
    applications = relationship("Application", back_populates="user")

class Club(Base):
    __tablename__ = "clubs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True)
    category = Column(String)
    tagline = Column(String)
    description = Column(Text)
    logo_url = Column(String)
    banner_url = Column(String)
    founded_year = Column(Integer)
    is_accepting = Column(Boolean, default=True)
    
    # Relationships
    members = relationship("User", secondary=club_members, back_populates="clubs")
    projects = relationship("Project", back_populates="club")
    applications = relationship("Application", back_populates="club")
    events = relationship("Event", back_populates="club")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    date = Column(String)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    
    # Relationships
    club = relationship("Club", back_populates="projects")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String) # Technical, Cultural, etc.
    banner = Column(String)  # Banner URL
    date = Column(DateTime, nullable=False)
    location = Column(String)
    organizer_club_id = Column(Integer, ForeignKey("clubs.id"))
    registration_link = Column(String)  # Google Form or external registration URL
    registration_deadline = Column(DateTime)
    status = Column(String, default="Upcoming") # Upcoming, Ongoing, Past
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    club = relationship("Club", back_populates="events")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    club_id = Column(Integer, ForeignKey("clubs.id"))
    position = Column(String)
    motivation = Column(Text)
    skills = Column(Text)
    portfolio_link = Column(String)
    resume_url = Column(String)
    availability = Column(String)
    contact_number = Column(String)
    status = Column(String, default="Pending") # Pending, Under Review, Interview Scheduled, Approved, Rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="applications")
    club = relationship("Club", back_populates="applications")
