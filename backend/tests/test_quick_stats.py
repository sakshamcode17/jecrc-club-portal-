import pytest
from httpx import AsyncClient
from app.main import app
from app.models.models import User, Application, Club
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_quick_stats(db_session):
    user = User(
        email="stats_user@jecrc.edu.in",
        hashed_password=get_password_hash("password"),
        full_name="Stats User",
        is_active=True
    )
    db_session.add(user)
    await db_session.flush()
    
    club = Club(name="Stat Club", slug="stat-club")
    db_session.add(club)
    await db_session.flush()
    
    # Initially stats should be 0
    # Note: We'll implement a logic where the frontend or backend calculates this.
    # If the backend provides it in /api/users/me, we test that.
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", data={"username": user.email, "password": "password"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check profile for stats
        response = await ac.get("/api/users/me", headers=headers)
        user_data = response.json()
        # We expect these fields to be added to the schema
        assert user_data.get("active_clubs_count", 0) == 0
        
        # Add an accepted application
        app_accepted = Application(
            user_id=user.id,
            club_id=club.id,
            position="Lead",
            status="Accepted"
        )
        db_session.add(app_accepted)
        await db_session.commit()
        
        response = await ac.get("/api/users/me", headers=headers)
        user_data = response.json()
        assert user_data.get("active_clubs_count", 0) == 1
