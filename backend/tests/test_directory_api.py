import pytest

from app.models.models import Club, Directory


@pytest.mark.asyncio
async def test_directory_api_returns_entries(client, db_session):
    club = Club(name="Tech Club", slug="tech-club", category="Technical")
    db_session.add(club)
    await db_session.flush()

    db_session.add(
        Directory(
            name="Aarav Sharma",
            designation="President",
            role="Club Contact",
            phone="+91-9000000001",
            email="aarav@jecrc.edu.in",
            club_id=club.id,
        )
    )
    await db_session.commit()

    response = await client.get("/api/directory/")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Aarav Sharma"
    assert data[0]["designation"] == "President"
    assert data[0]["club"]["name"] == "Tech Club"
    assert data[0]["phone"] == "+91-9000000001"
    assert data[0]["email"] == "aarav@jecrc.edu.in"
    assert data[0]["role"] == "Club Contact"
