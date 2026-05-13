import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from app.models.models import Event

@pytest.mark.asyncio
async def test_event_status_filtering(client: AsyncClient, db_session):
    """Test filtering events by status."""
    now = datetime.utcnow()
    
    # Create events with different statuses
    e1 = Event(title="Upcoming Event", date=now + timedelta(days=10), status="Upcoming")
    e2 = Event(title="Past Event", date=now - timedelta(days=10), status="Past")
    e3 = Event(title="Ongoing Event", date=now, status="Ongoing")
    
    db_session.add_all([e1, e2, e3])
    await db_session.commit()
    
    # Test filter upcoming
    response = await client.get("/api/events/?status_filter=upcoming")
    data = response.json()
    assert any(e["title"] == "Upcoming Event" for e in data)
    assert not any(e["title"] == "Past Event" for e in data)

    # Test filter past
    response = await client.get("/api/events/?status_filter=past")
    data = response.json()
    assert any(e["title"] == "Past Event" for e in data)
    assert not any(e["title"] == "Upcoming Event" for e in data)
