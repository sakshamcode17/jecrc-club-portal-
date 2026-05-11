import asyncio
from app.db.session import async_session, engine
from app.models.models import Base, User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def create_admin():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "admin@jecrc.edu.in"))
        existing = result.scalars().first()

        if existing:
            # Ensure is_admin is set
            existing.is_admin = True
            await session.commit()
            print(f"Admin already exists: {existing.email} — ensured is_admin=True")
            return

        admin = User(
            email="admin@jecrc.edu.in",
            hashed_password=get_password_hash("admin@123"),
            full_name="JECRC Admin",
            enrollment_no=None,
            branch=None,
            semester=None,
            contact=None,
            is_active=True,
            is_admin=True,
        )
        session.add(admin)
        await session.commit()
        print("Created admin user: admin@jecrc.edu.in / admin@123")

if __name__ == "__main__":
    asyncio.run(create_admin())
