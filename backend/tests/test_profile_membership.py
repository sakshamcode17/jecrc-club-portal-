import pytest
from httpx import AsyncClient
from app.main import app
from app.models.models import User, Application, Club
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_profile_membership(db_session):
    user = User(
        email="profile_user@jecrc.edu.in",
        hashed_password=get_password_hash("password"),
        full_name="Profile User",
        is_active=True
    )
    db_session.add(user)
    await db_session.flush()
    
    # 1. No memberships initially
    async with AsyncClient(app=app, base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", data={"username": user.email, "password": "password"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # In our implementation, /api/users/me returns counts, and /api/applications/me returns the list
        response = await ac.get("/api/users/me", headers=headers)
        assert response.json()["active_clubs_count"] == 0
        
        # 2. After acceptance
        club = Club(name="Profile Club", slug="profile-club")
        db_session.add(club)
        await db_session.flush()
        
        app_accepted = Application(
            user_id=user.id,
            club_id=club.id,
            position="Member",
            status="Accepted"
        )
        db_session.add(app_accepted)
        await db_session.commit()
        
        response = await ac.get("/api/users/me", headers=headers)
        assert response.json()["active_clubs_count"] == 1
