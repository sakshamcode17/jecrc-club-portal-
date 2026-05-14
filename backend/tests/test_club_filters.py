import pytest

from app.models.models import Club


@pytest.mark.asyncio
async def test_club_category_filters(client, db_session):
    db_session.add_all(
        [
            Club(name="Maverick", slug="maverick", category="Media"),
            Club(name="JU Eagles", slug="ju-eagles", category="Sports"),
            Club(name="3C", slug="3c", category="Cultural"),
        ]
    )
    await db_session.commit()

    filtered = await client.get("/api/clubs/?category=Sports")
    assert filtered.status_code == 200
    filtered_data = filtered.json()
    assert len(filtered_data) == 1
    assert filtered_data[0]["name"] == "JU Eagles"

    all_clubs = await client.get("/api/clubs/?category=All")
    assert all_clubs.status_code == 200
    all_data = all_clubs.json()
    assert len(all_data) == 3
