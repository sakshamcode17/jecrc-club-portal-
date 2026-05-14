import pytest

from app.models.models import Club, ClubLeader, Project


@pytest.mark.asyncio
async def test_admin_club_updates_projects_leadership_and_recruitment(admin_client, db_session):
    club = Club(
        name="Renegade",
        slug="renegade",
        category="Cultural",
        logo_url="/logos/renegade_logo.png",
        is_accepting=True,
    )
    db_session.add(club)
    await db_session.flush()

    db_session.add(Project(title="Legacy Project", date="2023", description="Old", club_id=club.id))
    db_session.add(ClubLeader(name="Old Lead", role="Coordinator", email="old@jecrc.edu.in", club_id=club.id))
    await db_session.commit()

    update_payload = {
        "tagline": "Hip-hop, rap, and expression.",
        "description": "Urban arts collective.",
        "is_accepting": False,
        "projects": [
            {
                "title": "Hip-Hop Performances at JU Rhythm",
                "date": "Annual",
                "description": "Flagship stage showcases."
            },
            {
                "title": "Rap and Beatbox Workshops",
                "date": "Monthly",
                "description": "Practice and performance circles."
            }
        ],
        "leadership": [
            {
                "name": "Samar Khan",
                "role": "Community Lead",
                "email": "samar.khan@jecrc.edu.in"
            }
        ]
    }

    update_response = await admin_client.put(f"/api/admin/clubs/{club.id}", json=update_payload)
    assert update_response.status_code == 200
    updated = update_response.json()

    assert updated["is_accepting"] is False
    assert updated["tagline"] == "Hip-hop, rap, and expression."
    assert len(updated["projects"]) == 2
    assert updated["projects"][0]["title"] == "Hip-Hop Performances at JU Rhythm"
    assert len(updated["leadership"]) == 1
    assert updated["leadership"][0]["name"] == "Samar Khan"

    recruitment_response = await admin_client.put(
        f"/api/admin/clubs/{club.id}/recruitment",
        json={"is_accepting": True},
    )
    assert recruitment_response.status_code == 200
    assert recruitment_response.json()["is_accepting"] is True
