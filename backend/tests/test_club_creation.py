import pytest


@pytest.mark.asyncio
async def test_admin_club_creation_with_projects_and_leadership(admin_client):
    payload = {
        "name": "JU VOGUE",
        "slug": "ju-vogue",
        "category": "Fashion",
        "tagline": "Style and stage confidence",
        "description": "Creative fashion community.",
        "logo_url": "/logos/JU VOGUE_logo.png",
        "is_accepting": True,
        "projects": [
            {
                "title": "Modeling Workshop Initiative",
                "date": "2024",
                "description": "Runway and grooming sessions."
            }
        ],
        "leadership": [
            {
                "name": "Tanya Bhatia",
                "role": "Fashion Lead",
                "email": "tanya.bhatia@jecrc.edu.in"
            }
        ]
    }

    response = await admin_client.post("/api/admin/clubs", json=payload)
    assert response.status_code == 201

    created = response.json()
    assert created["name"] == "JU VOGUE"
    assert created["slug"] == "ju-vogue"
    assert created["logo_url"] == "/logos/JU VOGUE_logo.png"
    assert created["is_accepting"] is True
    assert len(created["projects"]) == 1
    assert created["projects"][0]["title"] == "Modeling Workshop Initiative"
    assert len(created["leadership"]) == 1
    assert created["leadership"][0]["role"] == "Fashion Lead"

    public_response = await admin_client.get("/api/clubs/ju-vogue")
    assert public_response.status_code == 200
    public_data = public_response.json()
    assert public_data["name"] == "JU VOGUE"
    assert public_data["projects"][0]["title"] == "Modeling Workshop Initiative"
