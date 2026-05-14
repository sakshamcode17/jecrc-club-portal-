import pytest

from app.models.models import Club, ClubLeader, Project


@pytest.mark.asyncio
async def test_club_detail_payload_includes_logo_projects_and_leadership(client, db_session):
    club = Club(
        name="JECRC MUN Society",
        slug="jecrc-mun-society",
        category="Diplomacy",
        tagline="Debate. Diplomacy. Leadership.",
        description="Official MUN community.",
        logo_url="/logos/JECRC MUN Society.png",
        is_accepting=True,
    )
    db_session.add(club)
    await db_session.flush()

    db_session.add(
        Project(
            title="JECRC Diplomacy Summit",
            date="Annual",
            description="Large-scale MUN conference.",
            club_id=club.id,
        )
    )
    db_session.add(
        ClubLeader(
            name="Aman Mehta",
            role="Secretary General",
            email="aman.mehta@jecrc.edu.in",
            club_id=club.id,
        )
    )
    await db_session.commit()

    response = await client.get("/api/clubs/jecrc-mun-society")
    assert response.status_code == 200

    data = response.json()
    assert data["slug"] == "jecrc-mun-society"
    assert data["logo_url"] == "/logos/JECRC MUN Society.png"
    assert data["is_accepting"] is True
    assert len(data["projects"]) == 1
    assert data["projects"][0]["title"] == "JECRC Diplomacy Summit"
    assert len(data["leadership"]) == 1
    assert data["leadership"][0]["role"] == "Secretary General"
