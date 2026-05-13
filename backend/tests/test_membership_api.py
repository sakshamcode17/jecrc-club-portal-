import pytest
from httpx import AsyncClient
from app.main import app
from app.models.models import User, Application, Club
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_membership_api(db_session):
    user = User(
        email="api_user@jecrc.edu.in",
        hashed_password=get_password_hash("password"),
        full_name="API User",
        is_active=True
    )
    db_session.add(user)
    await db_session.flush()
    
    club = Club(name="API Club", slug="api-club")
    db_session.add(club)
    await db_session.flush()
    
    app_accepted = Application(
        user_id=user.id,
        club_id=club.id,
        position="Coordinator",
        status="Accepted"
    )
    db_session.add(app_accepted)
    await db_session.commit()
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", data={"username": user.email, "password": "password"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # We'll create a dedicated membership endpoint or reuse applications
        # The requirement says "Membership Visibility: Display clubs ONLY when: application status = Accepted"
        response = await ac.get("/api/applications/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        accepted = [d for d in data if d["status"] == "Accepted"]
        assert len(accepted) == 1
        assert accepted[0]["position"] == "Coordinator"
        assert accepted[0]["club"]["name"] == "API Club"
