import pytest

from app.models.models import Club


@pytest.mark.asyncio
async def test_admin_directory_crud(admin_client, db_session):
    club = Club(name="Culture Club", slug="culture-club", category="Cultural")
    db_session.add(club)
    await db_session.commit()

    create_payload = {
        "name": "Neha Gupta",
        "designation": "Coordinator",
        "role": "Club Contact",
        "phone": "+91-9000000002",
        "email": "neha@jecrc.edu.in",
        "club_id": club.id,
    }
    create_response = await admin_client.post("/api/admin/directory", json=create_payload)
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["name"] == "Neha Gupta"
    assert created["club"]["id"] == club.id

    update_payload = {
        "designation": "Faculty Coordinator",
        "role": "Authority",
        "club_id": None,
    }
    update_response = await admin_client.put(
        f"/api/admin/directory/{created['id']}",
        json=update_payload,
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["designation"] == "Faculty Coordinator"
    assert updated["role"] == "Authority"
    assert updated["club"] is None

    delete_response = await admin_client.delete(f"/api/admin/directory/{created['id']}")
    assert delete_response.status_code == 204

    list_response = await admin_client.get("/api/admin/directory")
    assert list_response.status_code == 200
    assert list_response.json() == []
