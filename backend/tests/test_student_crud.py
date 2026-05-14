import pytest


@pytest.mark.asyncio
async def test_admin_student_crud(admin_client):
    create_payload = {
        "email": "student_crud@jecrc.edu.in",
        "full_name": "CRUD Student",
        "enrollment_no": "JU-CRUD-001",
        "branch": "CSE",
        "semester": "6",
        "contact": "+91-9000000011",
        "is_active": True,
    }

    create_response = await admin_client.post("/api/admin/students", json=create_payload)
    assert create_response.status_code == 201
    created = create_response.json()
    student_id = created["student"]["id"]

    list_response = await admin_client.get("/api/admin/students?search=CRUD")
    assert list_response.status_code == 200
    assert any(student["id"] == student_id for student in list_response.json())

    detail_response = await admin_client.get(f"/api/admin/students/{student_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["email"] == "student_crud@jecrc.edu.in"

    update_payload = {
        "full_name": "CRUD Student Updated",
        "branch": "AIML",
        "semester": "7",
        "is_active": False,
    }
    update_response = await admin_client.put(f"/api/admin/students/{student_id}", json=update_payload)
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["full_name"] == "CRUD Student Updated"
    assert updated["branch"] == "AIML"
    assert updated["is_active"] is False

    delete_response = await admin_client.delete(f"/api/admin/students/{student_id}")
    assert delete_response.status_code == 204

    missing_response = await admin_client.get(f"/api/admin/students/{student_id}")
    assert missing_response.status_code == 404
