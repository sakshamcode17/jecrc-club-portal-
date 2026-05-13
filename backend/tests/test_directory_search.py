import pytest

from app.models.models import Club, Directory


@pytest.mark.asyncio
async def test_directory_search_by_name_designation_and_club(client, db_session):
    makerspace = Club(name="Makerspace", slug="makerspace", category="Technical")
    db_session.add(makerspace)
    await db_session.flush()

    db_session.add_all(
        [
            Directory(
                name="Ritu Singh",
                designation="Dean Student Welfare",
                role="Authority",
                email="ritu@jecrc.ac.in",
            ),
            Directory(
                name="Karan Verma",
                designation="President",
                role="Club Contact",
                club_id=makerspace.id,
                email="karan@jecrc.edu.in",
            ),
        ]
    )
    await db_session.commit()

    by_name = await client.get("/api/directory/?search=ritu")
    assert by_name.status_code == 200
    assert len(by_name.json()) == 1
    assert by_name.json()[0]["name"] == "Ritu Singh"

    by_designation = await client.get("/api/directory/?search=president")
    assert by_designation.status_code == 200
    assert len(by_designation.json()) == 1
    assert by_designation.json()[0]["name"] == "Karan Verma"

    by_club = await client.get("/api/directory/?search=makerspace")
    assert by_club.status_code == 200
    assert len(by_club.json()) == 1
    assert by_club.json()[0]["name"] == "Karan Verma"
