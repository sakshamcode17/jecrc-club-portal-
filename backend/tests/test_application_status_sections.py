import pytest

from app.models.models import Application, Club, User
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_application_sections_and_bulk_status_update(admin_client, db_session):
    club = Club(name="Apps Club", slug="apps-club", category="Technical")
    db_session.add(club)
    await db_session.flush()

    users = []
    for idx in range(4):
        user = User(
            email=f"apps_user_{idx}@jecrc.edu.in",
            hashed_password=get_password_hash("password"),
            full_name=f"Apps User {idx}",
            is_active=True,
            is_admin=False,
        )
        db_session.add(user)
        users.append(user)
    await db_session.flush()

    statuses = ["Pending", "Accepted", "Rejected", "Interview Scheduled"]
    app_ids = []
    for user, status in zip(users, statuses):
        application = Application(
            user_id=user.id,
            club_id=club.id,
            position="Member",
            status=status,
        )
        db_session.add(application)
        await db_session.flush()
        app_ids.append(application.id)

    await db_session.commit()

    pending_response = await admin_client.get("/api/admin/applications?status_filter=Pending")
    accepted_response = await admin_client.get("/api/admin/applications?status_filter=Accepted")
    rejected_response = await admin_client.get("/api/admin/applications?status_filter=Rejected")
    interview_response = await admin_client.get("/api/admin/applications?status_filter=Interview Scheduled")

    assert pending_response.status_code == 200
    assert accepted_response.status_code == 200
    assert rejected_response.status_code == 200
    assert interview_response.status_code == 200

    assert len(pending_response.json()) == 1
    assert len(accepted_response.json()) == 1
    assert len(rejected_response.json()) == 1
    assert len(interview_response.json()) == 1

    bulk_response = await admin_client.put(
        "/api/admin/applications/bulk-status",
        json={"application_ids": app_ids[:2], "status": "Interview Scheduled"},
    )
    assert bulk_response.status_code == 200
    assert bulk_response.json()["updated_count"] == 2

    refreshed = await admin_client.get("/api/admin/applications?status_filter=Interview Scheduled")
    assert refreshed.status_code == 200
    assert len(refreshed.json()) == 3
