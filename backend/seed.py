import asyncio
from app.db.session import async_session, engine
from app.models.models import Base, Club, Project

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
        
        await session.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
