import asyncio
from sqlalchemy import select
from app.db.session import async_session, engine
from app.models.models import Base, Club, Project, Directory

CLUBS_DATA = [
    {
        "name": "JU Makerspace",
        "slug": "ju-makerspace",
        "category": "Technical",
        "tagline": "Where imagination meets innovation.",
        "description": "JU Makerspace is JECRC University's flagship innovation hub, providing students with access to 3D printers, laser cutters, and high-end electronics.",
        "logo_url": "/logos/Makerspace_logo.png",
        "projects": [
            {"title": "Smart Campus Navigation", "date": "Dec 2023", "description": "An AR-based navigation system for the JECRC campus developed by students."}
        ]
    },
    {
        "name": "JU Aashayein",
        "slug": "ju-aashayein",
        "category": "Social",
        "tagline": "The Life-Saving Wing of JECRC.",
        "description": "Dedicated to blood donation drives and providing education to underprivileged children through our 'Zindagi' initiative.",
        "logo_url": "/logos/Aashayein_logo.png",
        "projects": [
            {"title": "Mission 1000 Units", "date": "Jan 2024", "description": "A record-breaking blood donation drive collecting 1000+ units in a single day."}
        ]
    },
    {
        "name": "JIC (JECRC Incubation Centre)",
        "slug": "jic",
        "category": "Entrepreneurship",
        "tagline": "Empowering the Entrepreneurs of Tomorrow.",
        "description": "Providing budding student entrepreneurs with mentorship, seed funding, and co-working spaces to turn ideas into startups.",
        "logo_url": "/logos/JIC_logo.png",
        "projects": [
            {"title": "Incubated Startups 2023", "date": "Continuous", "description": "Successfully incubated 5 student-led startups with a total valuation of 50 Lakhs."}
        ]
    },
    {
        "name": "JU Abhivyakti",
        "slug": "ju-abhivyakti",
        "category": "Cultural",
        "tagline": "The Voice of Creativity.",
        "description": "Premier literary and dramatics club of JECRC. A platform for students to express themselves through poetry and theater.",
        "logo_url": "/logos/Abhivyakti_logo.png",
        "projects": [
            {"title": "Rangmanch 2023", "date": "Nov 2023", "description": "A series of theatrical performances attracting 2000+ audience members."}
        ]
    },
    {
        "name": "Swaraag",
        "slug": "swaraag",
        "category": "Music",
        "description": "The soul-stirring music club of JECRC, bringing together vocalists and instrumentalists.",
        "logo_url": "/logos/Swaraag_logo.png"
    },
    {
        "name": "Maverick",
        "slug": "maverick",
        "category": "Technical",
        "description": "A high-octane automobile and racing club focused on formula-style car building.",
        "logo_url": "/logos/Maverick_logo.png"
    },
    {
        "name": "Gladiators",
        "slug": "gladiators",
        "category": "Sports",
        "description": "The official sports club, managing university teams and annual athletic meets.",
        "logo_url": "/logos/Gladiator_logo.png"
    }
]

DIRECTORY_DATA = [
    {
        "name": "Dr. A. K. Sharma",
        "designation": "Dean Student Welfare",
        "role": "Authority",
        "phone": "+91-9876543210",
        "email": "dean.sw@jecrc.ac.in",
        "club_slug": None,
    },
    {
        "name": "Riya Jain",
        "designation": "Club President",
        "role": "Club Contact",
        "phone": "+91-9123456780",
        "email": "riya.jain@jecrc.edu.in",
        "club_slug": "ju-makerspace",
    },
    {
        "name": "Harsh Vardhan",
        "designation": "Core Coordinator",
        "role": "Club Contact",
        "phone": "+91-9988776655",
        "email": "harsh.vardhan@jecrc.edu.in",
        "club_slug": "ju-aashayein",
    },
]

async def seed():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        for club_data in CLUBS_DATA:
            projects_data = club_data.pop("projects", [])
            club = Club(**club_data)
            session.add(club)
            await session.flush() # Get club ID
            
            for p_data in projects_data:
                project = Project(**p_data, club_id=club.id)
                session.add(project)

        for raw_entry_data in DIRECTORY_DATA:
            entry_data = dict(raw_entry_data)
            club_slug = entry_data.pop("club_slug", None)
            club_id = None
            if club_slug:
                club_result = await session.execute(select(Club).where(Club.slug == club_slug))
                club = club_result.scalars().first()
                club_id = club.id if club else None
            directory_entry = Directory(**entry_data, club_id=club_id)
            session.add(directory_entry)

        # Add sample events
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        
        events_data = [
            {
                "title": "Tech-Nexus Hackathon",
                "description": "A 24-hour hackathon for building innovative solutions for campus life.",
                "date": now + timedelta(days=5),
                "location": "Auditorium, Block A",
                "organizer_club_id": 1, # Makerspace
                "registration_deadline": now + timedelta(days=2),
                "status": "Upcoming",
                "banner": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            },
            {
                "title": "Blood Donation Drive 2024",
                "description": "Save a life today! Annual blood donation camp organized in collaboration with Red Cross.",
                "date": now - timedelta(days=1), # Ongoing
                "location": "Health Center",
                "organizer_club_id": 2, # Aashayein
                "registration_deadline": now - timedelta(days=2),
                "status": "Ongoing",
                "banner": "https://images.unsplash.com/photo-1536859355448-76f92eb7a3de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            },
            {
                "title": "Cultural Night 2023",
                "description": "A grand celebration of music, dance, and drama.",
                "date": now - timedelta(days=30), # Past
                "location": "Main Stage",
                "organizer_club_id": 4, # Abhivyakti
                "registration_deadline": now - timedelta(days=35),
                "status": "Past",
                "banner": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            }
        ]
        
        from app.models.models import Event
        for e_data in events_data:
            event = Event(**e_data)
            session.add(event)
        
        await session.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
