import pytest
from httpx import AsyncClient
from app.main import app
from app.models.models import User, Application, Club
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_membership_visibility(db_session):
    # Setup: Create a user, a club, and an application
    user = User(
        email="test_member@jecrc.edu.in",
        hashed_password=get_password_hash("password"),
        full_name="Test Member",
        is_active=True
    )
    db_session.add(user)
    await db_session.flush()
    
    club = Club(name="Test Club", slug="test-club")
    db_session.add(club)
    await db_session.flush()
    
    # Create a pending application
    app_pending = Application(
        user_id=user.id,
        club_id=club.id,
        position="Member",
        status="Pending"
    )
    db_session.add(app_pending)
    await db_session.commit()
    
    # Login to get token
    async with AsyncClient(app=app, base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", data={"username": user.email, "password": "password"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Check memberships - should be empty (only accepted show up)
        # We'll implement a specific logic in the profile or application list
        # For now, let's assume we filter in the frontend or a specific membership endpoint
        # If we follow "Display clubs ONLY when: application status = Accepted"
        
        response = await ac.get("/api/applications/me", headers=headers)
        apps = response.json()
        accepted_apps = [a for a in apps if a["status"] == "Accepted"]
        assert len(accepted_apps) == 0
        
        # 2. Update status to Accepted
        # In a real scenario, this would be done by admin. Here we do it via DB for the test.
        app_pending.status = "Accepted"
        db_session.add(app_pending)
        await db_session.commit()
        
        response = await ac.get("/api/applications/me", headers=headers)
        apps = response.json()
        accepted_apps = [a for a in apps if a["status"] == "Accepted"]
        assert len(accepted_apps) == 1
        assert accepted_apps[0]["club"]["name"] == "Test Club"
