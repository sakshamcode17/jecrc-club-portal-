import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select

from app.db.session import async_session, engine
from app.models.models import Base, Club, Directory, Event, Project, ClubLeader


CLUBS_DATA = [
    {
        "name": "JU Makerspace",
        "slug": "ju-makerspace",
        "category": "Technical",
        "tagline": "Where imagination meets innovation.",
        "description": "JECRC's flagship innovation hub for prototyping, embedded systems, robotics, and product design.",
        "logo_url": "/logos/Makerspace_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Smart Campus Navigation", "date": "Dec 2023", "description": "An AR-based wayfinding system built by student innovators."},
            {"title": "Maker-A-Thon", "date": "Apr 2024", "description": "Rapid prototyping sprint across IoT, 3D design, and fabrication."},
            {"title": "Open Hardware Week", "date": "Sep 2024", "description": "Hands-on workshops for PCB design and hardware debugging."},
        ],
        "leadership": [
            {"name": "Rahul Soni", "role": "President", "email": "rahul.soni@jecrc.edu.in"},
            {"name": "Ananya Verma", "role": "Technical Lead", "email": "ananya.verma@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU Aashayein",
        "slug": "ju-aashayein",
        "category": "Social",
        "tagline": "The life-saving wing of JECRC.",
        "description": "Community impact club focused on blood donation, social outreach, and education initiatives.",
        "logo_url": "/logos/Aashayein_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Mission 1000 Units", "date": "Jan 2024", "description": "Large-scale blood donation campaign across campus."},
            {"title": "Project Zindagi", "date": "Aug 2024", "description": "Learning support for underserved children in nearby communities."},
            {"title": "Community Health Drive", "date": "Nov 2024", "description": "Awareness camps and volunteer-led assistance drives."},
        ],
        "leadership": [
            {"name": "Sneha Gupta", "role": "President", "email": "sneha.gupta@jecrc.edu.in"},
            {"name": "Karan Bhandari", "role": "Outreach Coordinator", "email": "karan.bhandari@jecrc.edu.in"},
        ],
    },
    {
        "name": "JIC (JECRC Incubation Centre)",
        "slug": "jic",
        "category": "Entrepreneurship",
        "tagline": "Start se startup tak.",
        "description": "Incubation ecosystem helping founders move from idea to MVP to market with mentors and investors.",
        "logo_url": "/logos/JIC_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "KHOJ: The Startup Conclave", "date": "2024", "description": "Founder-investor conclave with pitches, expo, and ecosystem partners."},
            {"title": "Leader's Talk Series", "date": "Ongoing", "description": "Leadership and startup journeys by notable entrepreneurs and policymakers."},
            {"title": "Accelerator Program", "date": "10-Week Cohort", "description": "Structured startup acceleration with mentoring and seed-fund exposure."},
        ],
        "leadership": [
            {"name": "Vikram Aditya", "role": "Head of Operations", "email": "vikram.aditya@jecrc.edu.in"},
            {"name": "Shivani Mathur", "role": "Incubation Manager", "email": "shivani.mathur@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU Abhivyakti",
        "slug": "ju-abhivyakti",
        "category": "Cultural",
        "tagline": "The voice of creativity.",
        "description": "Dramatics and theatre community enabling artistic expression, stagecraft, and social storytelling.",
        "logo_url": "/logos/Abhivyakti_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "JU Rhythm Theatre Performances", "date": "Annual", "description": "Flagship stage productions and dramatics showcases."},
            {"title": "Acting Workshops", "date": "Semester-wise", "description": "Practice circles for improvisation, script reading, and stage presence."},
            {"title": "Social Awareness Street Plays", "date": "Ongoing", "description": "Nukkad nataks on equality, environment, and mental health."},
        ],
        "leadership": [
            {"name": "Priya Sharma", "role": "Creative Head", "email": "priya.sharma@jecrc.edu.in"},
            {"name": "Harshit Arora", "role": "Stage Coordinator", "email": "harshit.arora@jecrc.edu.in"},
        ],
    },
    {
        "name": "Swaraag",
        "slug": "swaraag",
        "category": "Music",
        "tagline": "Indian and western music, one stage.",
        "description": "Official music club uniting vocalists and instrumentalists across genres.",
        "logo_url": "/logos/Swaraag_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "JU Euphoria Performances", "date": "Annual", "description": "Main-stage music showcases during flagship cultural celebrations."},
            {"title": "RAAG Weekend Blast", "date": "Recurring", "description": "Campus acoustic evenings and open sessions with Student Council."},
            {"title": "Wonder of Words Collaborations", "date": "WoW", "description": "Live collaborations with guest artists and literary events."},
        ],
        "leadership": [
            {"name": "Aarav Jain", "role": "Music Captain", "email": "aarav.jain@jecrc.edu.in"},
            {"name": "Megha Saxena", "role": "Performance Lead", "email": "megha.saxena@jecrc.edu.in"},
        ],
    },
    {
        "name": "Maverick",
        "slug": "maverick",
        "category": "Media",
        "tagline": "The visual memory of JECRC.",
        "description": "Official media and photography club capturing events and producing visual stories.",
        "logo_url": "/logos/Maverick_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "University Event Coverage", "date": "Ongoing", "description": "Photo/video documentation across major campus events."},
            {"title": "Professional Photography Workshops", "date": "2024", "description": "Mentor-led learning on lighting, composition, and post-production."},
            {"title": "Photowalks & Creative Challenges", "date": "Monthly", "description": "Theme-based shoots and portfolio-building competitions."},
        ],
        "leadership": [
            {"name": "Yash Pandiyar", "role": "Media Lead", "email": "yash.pandiyar@jecrc.edu.in"},
            {"name": "Vivek Surya", "role": "Photography Mentor", "email": "vivek.surya@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU-Socialz",
        "slug": "ju-socialz",
        "category": "Media",
        "tagline": "The social media marketing cell.",
        "description": "Student-led digital storytelling team that drives JECRC's brand presence across platforms.",
        "logo_url": "/logos/socials_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Campus Storytelling Pipeline", "date": "Ongoing", "description": "Reels, posters, blogs, and announcements for all major activities."},
            {"title": "Video Production Studio", "date": "Ongoing", "description": "Scripting, filming, and post-production for digital channels."},
            {"title": "Campaign Analytics & Growth", "date": "Quarterly", "description": "Audience insights and campaign execution for key milestones."},
        ],
        "leadership": [
            {"name": "Niharika Gupta", "role": "Content Lead", "email": "niharika.gupta@jecrc.edu.in"},
            {"name": "Rajat Meena", "role": "Digital Strategy Lead", "email": "rajat.meena@jecrc.edu.in"},
        ],
    },
    {
        "name": "Gladiators",
        "slug": "gladiators",
        "category": "Sports",
        "tagline": "JECRC's official esports force.",
        "description": "Competitive esports community representing JECRC in university and national circuits.",
        "logo_url": "/logos/Gladiator_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "JU VERVE Esports Championships", "date": "Annual", "description": "Multi-title competitive tournament operations and participation."},
            {"title": "Tournament Highlights & Streams", "date": "Ongoing", "description": "Live streams, recap edits, and gameplay showcases."},
            {"title": "Inter-University Representation", "date": "Seasonal", "description": "Competitive squads across BGMI, Valorant, FIFA, CSGO, and more."},
        ],
        "leadership": [
            {"name": "Arjun Rathore", "role": "Esports Captain", "email": "arjun.rathore@jecrc.edu.in"},
            {"name": "Dev Bansal", "role": "Tournament Coordinator", "email": "dev.bansal@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU Eagles",
        "slug": "ju-eagles",
        "category": "Sports",
        "tagline": "Strength, skill, spirit.",
        "description": "Official sports vertical promoting competitive athletics and intramural excellence.",
        "logo_url": "/logos/ju_eagles_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "JU VERVE Sports Fest", "date": "Annual", "description": "Inter-university sports fest across multiple disciplines."},
            {"title": "Premier League 2.0", "date": "2024", "description": "Auction-based campus leagues for football, cricket, and flag football."},
            {"title": "National Tournament Campaign", "date": "Ongoing", "description": "Structured preparation for inter-college and national competitions."},
        ],
        "leadership": [
            {"name": "Keshav Raj", "role": "Sports Captain", "email": "keshav.raj@jecrc.edu.in"},
            {"name": "Misha Sharma", "role": "Athlete Representative", "email": "misha.sharma@jecrc.edu.in"},
        ],
    },
    {
        "name": "Renegade",
        "slug": "renegade",
        "category": "Cultural",
        "tagline": "Hip-hop, rap, and raw expression.",
        "description": "Urban performing arts community for rap, beatboxing, and hip-hop culture.",
        "logo_url": "/logos/renegade_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "JU Rhythm Hip-Hop Stage", "date": "Annual", "description": "High-energy rap and beatbox performances on flagship stages."},
            {"title": "Freshers Hip-Hop Drive", "date": "Semester 1", "description": "Onboarding and talent discovery for new performers."},
            {"title": "Cyphers & Beatbox Workshops", "date": "Monthly", "description": "Skill circles for writing, flow, rhythm, and live presence."},
        ],
        "leadership": [
            {"name": "Samar Khan", "role": "Community Lead", "email": "samar.khan@jecrc.edu.in"},
            {"name": "Ritika Dadhich", "role": "Performance Mentor", "email": "ritika.dadhich@jecrc.edu.in"},
        ],
    },
    {
        "name": "3C",
        "slug": "3c",
        "category": "Cultural",
        "tagline": "Catchy cultural experiences for every JECRCian.",
        "description": "Student cultural club known for flagship campus experiences and entertainment-driven engagement.",
        "logo_url": "/logos/3C (Catchy Cultural Club)_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Salam-E-Hunar", "date": "Annual", "description": "Talent showcase platform for freshers and performers."},
            {"title": "Tour De Jaipur", "date": "Annual", "description": "Cultural city exploration and peer-bonding journey."},
            {"title": "Dandiya Nights", "date": "Navratri", "description": "Festival celebration with garba, dandiya, and campus-wide participation."},
        ],
        "leadership": [
            {"name": "Ishita Gupta", "role": "Club Head", "email": "ishita.gupta@jecrc.edu.in"},
            {"name": "Manav Chouhan", "role": "Event Director", "email": "manav.chouhan@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU VOGUE",
        "slug": "ju-vogue",
        "category": "Fashion",
        "tagline": "Style, stage, and self-expression.",
        "description": "Fashion and lifestyle club nurturing modeling, styling, and creative visual expression.",
        "logo_url": "/logos/JU VOGUE_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Modeling Workshop Initiative", "date": "2024", "description": "Runway, posture, and grooming sessions for beginners."},
            {"title": "Creative Fashion Shoots", "date": "Ongoing", "description": "Collaborative campaigns with stylists, photographers, and editors."},
            {"title": "Campus Fashion Showcases", "date": "Annual", "description": "Thematic fashion events with choreography and backstage production."},
        ],
        "leadership": [
            {"name": "Tanya Bhatia", "role": "Fashion Lead", "email": "tanya.bhatia@jecrc.edu.in"},
            {"name": "Aditya Solanki", "role": "Creative Director", "email": "aditya.solanki@jecrc.edu.in"},
        ],
    },
    {
        "name": "Literature Club",
        "slug": "literature-club",
        "category": "Literary",
        "tagline": "Where words meet voice.",
        "description": "Campus literature community for poetry, storytelling, and public speaking.",
        "logo_url": "/logos/Literature Club_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Open Mic Sessions", "date": "Recurring", "description": "Poetry, spoken word, and storytelling performances."},
            {"title": "Wonder of Words Participation", "date": "Annual", "description": "Literary festival collaborations with authors and speakers."},
            {"title": "Creative Writing Series", "date": "Monthly", "description": "Prompts, critique circles, and short story/poetry contests."},
        ],
        "leadership": [
            {"name": "Bhavya Jain", "role": "Literary Lead", "email": "bhavya.jain@jecrc.edu.in"},
            {"name": "Aditi Sharma", "role": "Open Mic Coordinator", "email": "aditi.sharma@jecrc.edu.in"},
        ],
    },
    {
        "name": "Quintessence Crew",
        "slug": "quintessence-crew",
        "category": "Dance",
        "tagline": "Precision, passion, performance.",
        "description": "Official dance club promoting excellence across hip-hop, contemporary, classical, and fusion styles.",
        "logo_url": "/logos/Quintessence Crew_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "D-Vibe Dance Celebration", "date": "Annual", "description": "Stage showcase for choreography and crew performances."},
            {"title": "Dance Training Sessions", "date": "Weekly", "description": "Technique-focused practice and mentorship for all levels."},
            {"title": "Inter-College Dance Competitions", "date": "Seasonal", "description": "University representation at external festivals and battles."},
        ],
        "leadership": [
            {"name": "Rhea Kapoor", "role": "Crew Captain", "email": "rhea.kapoor@jecrc.edu.in"},
            {"name": "Lakshya Saini", "role": "Choreography Lead", "email": "lakshya.saini@jecrc.edu.in"},
        ],
    },
    {
        "name": "Student Council",
        "slug": "student-council",
        "category": "Leadership",
        "tagline": "Student voice, student action.",
        "description": "Representative student body coordinating campus initiatives and leadership opportunities.",
        "logo_url": "/logos/Student Council_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Investiture Ceremony", "date": "Annual", "description": "Formal induction of student representatives and office bearers."},
            {"title": "JU Verve Sports Engagement", "date": "Annual", "description": "Student coordination and participation drives for campus sports."},
            {"title": "Campus Representation Program", "date": "Ongoing", "description": "Structured communication and welfare initiatives across departments."},
        ],
        "leadership": [
            {"name": "Council Office", "role": "President", "email": "studentcouncil@jecrc.edu.in"},
            {"name": "Council Office", "role": "General Secretary", "email": "gs.studentcouncil@jecrc.edu.in"},
        ],
    },
    {
        "name": "Zarurat",
        "slug": "zarurat",
        "category": "Social",
        "tagline": "Compassion in action.",
        "description": "Social welfare club focused on education support, dignity drives, and youth mentorship.",
        "logo_url": "/logos/Zarurat_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Free Education Initiative", "date": "Ongoing", "description": "Volunteer-led classes for underserved children."},
            {"title": "Vastra Samman Samaroh", "date": "Seasonal", "description": "Dignity-first clothing and essentials outreach campaign."},
            {"title": "Digital Mentorship Program", "date": "Ongoing", "description": "Guidance on academics, digital literacy, and confidence building."},
        ],
        "leadership": [
            {"name": "Nikita Sharma", "role": "Social Outreach Lead", "email": "nikita.sharma@jecrc.edu.in"},
            {"name": "Prateek Sharma", "role": "Volunteer Coordinator", "email": "prateek.sharma@jecrc.edu.in"},
        ],
    },
    {
        "name": "JECRC MUN Society",
        "slug": "jecrc-mun-society",
        "category": "Diplomacy",
        "tagline": "Debate. Diplomacy. Leadership.",
        "description": "Official MUN community building global awareness and negotiation skills through simulations.",
        "logo_url": "/logos/JECRC MUN Society.png",
        "is_accepting": True,
        "projects": [
            {"title": "JECRC Diplomacy Summit", "date": "Annual", "description": "Large-scale MUN conference hosting delegates nationwide."},
            {"title": "MUN Training Workshops", "date": "Recurring", "description": "Research, committee rules, and debate strategy sessions."},
            {"title": "National Delegate Participation", "date": "Seasonal", "description": "Student representation in top national MUN circuits."},
        ],
        "leadership": [
            {"name": "Aman Mehta", "role": "Secretary General", "email": "aman.mehta@jecrc.edu.in"},
            {"name": "Suhani Arora", "role": "Director General", "email": "suhani.arora@jecrc.edu.in"},
        ],
    },
    {
        "name": "Upscale",
        "slug": "upscale",
        "category": "Entrepreneurship",
        "tagline": "Build ideas into ventures.",
        "description": "Entrepreneurship club promoting startup thinking, pitching, and collaborative innovation.",
        "logo_url": "/logos/Upscale_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Startup Workshops", "date": "Monthly", "description": "Sessions on planning, go-to-market, and funding fundamentals."},
            {"title": "Business Pitch Competitions", "date": "Quarterly", "description": "Pitch practice with jury feedback and mentoring support."},
            {"title": "Networking & Collaboration Meets", "date": "Recurring", "description": "Peer-founder interactions with experts and ecosystem partners."},
        ],
        "leadership": [
            {"name": "Raghav Bhandari", "role": "Club President", "email": "raghav.bhandari@jecrc.edu.in"},
            {"name": "Ira Singh", "role": "Program Coordinator", "email": "ira.singh@jecrc.edu.in"},
        ],
    },
    {
        "name": "JU-NCC",
        "slug": "ju-ncc",
        "category": "Service",
        "tagline": "Unity and discipline.",
        "description": "NCC unit focused on leadership, patriotism, service, and structured cadet training.",
        "logo_url": "/logos/JU-NCC_logo.png",
        "is_accepting": True,
        "projects": [
            {"title": "Defence Counselling Session", "date": "2024", "description": "Career guidance for armed forces pathways and NCC special entries."},
            {"title": "Run for Equality", "date": "2024", "description": "Social-awareness fitness campaign led by cadet volunteers."},
            {"title": "RDC & National Camp Representation", "date": "Annual", "description": "Cadet selection and participation in high-prestige national camps."},
        ],
        "leadership": [
            {"name": "NCC Unit Office", "role": "Cadet Captain", "email": "ncc@jecrc.edu.in"},
            {"name": "NCC Unit Office", "role": "Training Coordinator", "email": "ncc.training@jecrc.edu.in"},
        ],
    },
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
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        for club_raw in CLUBS_DATA:
            club_data = dict(club_raw)
            projects_data = club_data.pop("projects", [])
            leadership_data = club_data.pop("leadership", [])

            club = Club(**club_data)
            session.add(club)
            await session.flush()

            for project_data in projects_data:
                session.add(Project(**project_data, club_id=club.id))

            for leader_data in leadership_data:
                session.add(ClubLeader(**leader_data, club_id=club.id))

        for raw_entry_data in DIRECTORY_DATA:
            entry_data = dict(raw_entry_data)
            club_slug = entry_data.pop("club_slug", None)
            club_id = None
            if club_slug:
                club_result = await session.execute(select(Club).where(Club.slug == club_slug))
                club = club_result.scalars().first()
                club_id = club.id if club else None
            session.add(Directory(**entry_data, club_id=club_id))

        now = datetime.utcnow()
        events_data = [
            {
                "title": "Tech-Nexus Hackathon",
                "description": "A 24-hour hackathon for building innovative solutions for campus life.",
                "date": now + timedelta(days=5),
                "location": "Auditorium, Block A",
                "organizer_club_id": 1,
                "registration_deadline": now + timedelta(days=2),
                "status": "Upcoming",
                "banner": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            },
            {
                "title": "Blood Donation Drive 2024",
                "description": "Annual blood donation camp organized in collaboration with Red Cross.",
                "date": now - timedelta(days=1),
                "location": "Health Center",
                "organizer_club_id": 2,
                "registration_deadline": now - timedelta(days=2),
                "status": "Ongoing",
                "banner": "https://images.unsplash.com/photo-1536859355448-76f92eb7a3de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            },
            {
                "title": "Cultural Night 2023",
                "description": "A grand celebration of music, dance, and drama.",
                "date": now - timedelta(days=30),
                "location": "Main Stage",
                "organizer_club_id": 4,
                "registration_deadline": now - timedelta(days=35),
                "status": "Past",
                "banner": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            },
        ]

        for event_data in events_data:
            session.add(Event(**event_data))

        await session.commit()

    print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
