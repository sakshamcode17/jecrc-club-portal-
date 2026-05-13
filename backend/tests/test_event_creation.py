import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_admin_create_event(admin_client: AsyncClient):
    """Test admin can create an event."""
    event_data = {
        "title": "New Admin Event",
        "description": "Created by admin",
        "date": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "location": "Admin Office",
        "status": "Upcoming",
        "category": "Admin"
    }
    response = await admin_client.post("/api/events/", json=event_data)
    assert response.status_code == 201
    assert response.json()["title"] == "New Admin Event"

@pytest.mark.asyncio
async def test_student_cannot_create_event(client: AsyncClient):
    """Test student (non-admin) cannot create an event."""
    event_data = {
        "title": "Unauthorized Event",
        "description": "Should fail",
        "date": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "location": "Nowhere",
        "status": "Upcoming"
    }
    # client is unauthenticated or student authenticated
    response = await client.post("/api/events/", json=event_data)
    # Depending on how security is set up, it might be 401 or 403
    assert response.status_code in [401, 403]
