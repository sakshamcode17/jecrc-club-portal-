import asyncio
import pytest
from uuid import uuid4

from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.models import Base, User
from app.main import app

# Use an in-memory SQLite for tests
DATABASE_URL = "sqlite+aiosqlite://"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    yield engine
    await engine.dispose()

@pytest.fixture
async def db_session(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        # Override get_db dependency
        async def override_get_db():
            yield session
        
        app.dependency_overrides[get_db] = override_get_db
        yield session
        app.dependency_overrides.clear()


@pytest.fixture
async def client(db_session):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def admin_client(client, db_session):
    admin_email = f"admin_{uuid4().hex[:8]}@jecrc.edu.in"
    admin_password = "admin-password"

    admin_user = User(
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        full_name="Test Admin",
        is_active=True,
        is_admin=True,
    )
    db_session.add(admin_user)
    await db_session.commit()

    login_response = await client.post(
        "/api/auth/login",
        data={"username": admin_email, "password": admin_password},
    )
    token = login_response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})

    yield client
