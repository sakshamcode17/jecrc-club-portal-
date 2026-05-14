import pytest


@pytest.mark.asyncio
async def test_duplicate_student_email_and_enrollment_validation(admin_client):
    payload = {
        "email": "duplicate_student@jecrc.edu.in",
        "full_name": "Duplicate Student",
        "enrollment_no": "DUP-001",
        "branch": "CSE",
        "semester": "3",
        "is_active": True,
    }

    first = await admin_client.post("/api/admin/students", json=payload)
    assert first.status_code == 201

    duplicate_email_payload = {
        **payload,
        "enrollment_no": "DUP-002",
    }
    duplicate_email = await admin_client.post("/api/admin/students", json=duplicate_email_payload)
    assert duplicate_email.status_code == 400
    assert "email" in duplicate_email.json()["detail"].lower()

    duplicate_enrollment_payload = {
        **payload,
        "email": "different_student@jecrc.edu.in",
    }
    duplicate_enrollment = await admin_client.post("/api/admin/students", json=duplicate_enrollment_payload)
    assert duplicate_enrollment.status_code == 400
    assert "enrollment" in duplicate_enrollment.json()["detail"].lower()
