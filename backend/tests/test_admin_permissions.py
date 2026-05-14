import pytest

from app.core.security import get_password_hash
from app.models.models import User


@pytest.fixture
async def student_client(client, db_session):
    student = User(
        email="student_perm@jecrc.edu.in",
        hashed_password=get_password_hash("student-pass"),
        full_name="Student Perm",
        is_active=True,
        is_admin=False,
    )
    db_session.add(student)
    await db_session.commit()

    login_response = await client.post(
        "/api/auth/login",
        data={"username": "student_perm@jecrc.edu.in", "password": "student-pass"},
    )
    token = login_response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield client


@pytest.mark.asyncio
async def test_non_admin_cannot_access_student_admin_routes(student_client):
    list_response = await student_client.get("/api/admin/students")
    assert list_response.status_code == 403

    create_response = await student_client.post(
        "/api/admin/students",
        json={
            "email": "blocked@jecrc.edu.in",
            "full_name": "Blocked",
            "enrollment_no": "BLOCK-001",
            "is_active": True,
        },
    )
    assert create_response.status_code == 403


@pytest.mark.asyncio
async def test_non_admin_cannot_bulk_update_application_status(student_client):
    response = await student_client.put(
        "/api/admin/applications/bulk-status",
        json={"application_ids": [1, 2], "status": "Accepted"},
    )
    assert response.status_code == 403
