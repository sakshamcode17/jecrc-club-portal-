import asyncio
from app.db.session import async_session, engine
from app.models.models import Base, User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def create_saksham():
    async with engine.begin() as conn:
        # Make sure tables exist (don't drop)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if user already exists
        result = await session.execute(select(User).where(User.email == "saksham@jecrc.edu.in"))
        existing = result.scalars().first()
        
        if existing:
            print(f"User already exists: {existing.email} (id={existing.id})")
            return

        user = User(
            email="saksham@jecrc.edu.in",
            hashed_password=get_password_hash("123456"),
            full_name="Saksham",
            enrollment_no="24BCON2068",
            branch="B.Tech CSE",
            semester="4th Semester",
            contact="9999999999",
            is_active=True,
            is_admin=False,
        )
        session.add(user)
        await session.commit()
        print(f"Created user: saksham@jecrc.edu.in with password: 123456")

if __name__ == "__main__":
    asyncio.run(create_saksham())
