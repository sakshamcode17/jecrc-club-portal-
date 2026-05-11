"""
Seed script to create 4 dummy student accounts.
Run from backend/ directory: python seed_students.py
"""
import asyncio
from app.db.session import async_session as AsyncSessionLocal
from app.models.models import User
from app.core.security import get_password_hash
from sqlalchemy.future import select

STUDENTS = [
    {
        "full_name": "Dhruv Sharma",
        "email": "dhruv@jecrc.edu.in",
        "password": "dhruv@123",
        "enrollment_no": "24BCON2101",
        "branch": "B.Tech Computer Science",
        "semester": "4th Semester",
        "contact": "9812345601",
    },
    {
        "full_name": "Kinjal Mehta",
        "email": "kinjal@jecrc.edu.in",
        "password": "kinjal@123",
        "enrollment_no": "24BCON2102",
        "branch": "B.Tech Electronics",
        "semester": "2nd Semester",
        "contact": "9812345602",
    },
    {
        "full_name": "Rishabh Verma",
        "email": "rishabh@jecrc.edu.in",
        "password": "rishabh@123",
        "enrollment_no": "24BCON2103",
        "branch": "B.Tech Mechanical",
        "semester": "6th Semester",
        "contact": "9812345603",
    },
    {
        "full_name": "Kartik Joshi",
        "email": "kartik@jecrc.edu.in",
        "password": "kartik@123",
        "enrollment_no": "24BCON2104",
        "branch": "B.Tech Civil",
        "semester": "3rd Semester",
        "contact": "9812345604",
    },
]

async def seed():
    async with AsyncSessionLocal() as db:
        created = 0
        skipped = 0
        for s in STUDENTS:
            result = await db.execute(select(User).where(User.email == s["email"]))
            existing = result.scalars().first()
            if existing:
                print(f"  [SKIP] {s['full_name']} ({s['email']}) already exists.")
                skipped += 1
                continue

            user = User(
                full_name=s["full_name"],
                email=s["email"],
                hashed_password=get_password_hash(s["password"]),
                enrollment_no=s["enrollment_no"],
                branch=s["branch"],
                semester=s["semester"],
                contact=s["contact"],
                is_active=True,
                is_admin=False,
            )
            db.add(user)
            created += 1
            print(f"  [OK]   {s['full_name']} ({s['email']}) — password: {s['password']}")

        await db.commit()
        print(f"\nDone! Created {created} student(s), skipped {skipped} existing.")

if __name__ == "__main__":
    asyncio.run(seed())
