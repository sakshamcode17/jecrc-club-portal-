import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from app.models.models import Event

@pytest.mark.asyncio
async def test_admin_update_event(admin_client: AsyncClient, db_session):
    """Test admin can update an event."""
    event = Event(title="Old Title", date=datetime.utcnow() + timedelta(days=1), status="Upcoming")
    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)
    
    update_data = {"title": "Updated Title"}
    response = await admin_client.put(f"/api/events/{event.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"

@pytest.mark.asyncio
async def test_admin_delete_event(admin_client: AsyncClient, db_session):
    """Test admin can delete an event."""
    event = Event(title="To Delete", date=datetime.utcnow() + timedelta(days=1), status="Upcoming")
    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)
    
    response = await admin_client.delete(f"/api/events/{event.id}")
    assert response.status_code == 204
    
    # Verify deletion
    response = await admin_client.get(f"/api/events/{event.id}")
    assert response.status_code == 404
