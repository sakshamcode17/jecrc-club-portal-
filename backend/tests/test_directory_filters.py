import pytest

from app.models.models import Club, Directory


@pytest.mark.asyncio
async def test_directory_club_and_role_filters(client, db_session):
    tech = Club(name="Tech Club", slug="tech-club", category="Technical")
    social = Club(name="Social Club", slug="social-club", category="Social")
    db_session.add_all([tech, social])
    await db_session.flush()

    db_session.add_all(
        [
            Directory(name="A", designation="Lead", role="Club Contact", club_id=tech.id),
            Directory(name="B", designation="Lead", role="Authority", club_id=social.id),
            Directory(name="C", designation="Lead", role="Club Contact", club_id=social.id),
        ]
    )
    await db_session.commit()

    club_filtered = await client.get(f"/api/directory/?club_id={social.id}")
    assert club_filtered.status_code == 200
    club_filtered_data = club_filtered.json()
    assert len(club_filtered_data) == 2
    assert {entry["name"] for entry in club_filtered_data} == {"B", "C"}

    role_filtered = await client.get("/api/directory/?role=Authority")
    assert role_filtered.status_code == 200
    role_filtered_data = role_filtered.json()
    assert len(role_filtered_data) == 1
    assert role_filtered_data[0]["name"] == "B"
