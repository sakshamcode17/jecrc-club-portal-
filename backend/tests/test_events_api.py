import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_get_events_public(client: AsyncClient):
    """Test public access to events list."""
    response = await client.get("/api/events/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_event_detail(client: AsyncClient, db_session):
    """Test getting a single event detail."""
    # Create an event first
    from app.models.models import Event
    event = Event(
        title="Test Event",
        description="Test Description",
        date=datetime.utcnow() + timedelta(days=1),
        location="Test Location",
        status="Upcoming"
    )
    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)

    response = await client.get(f"/api/events/{event.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Event"
