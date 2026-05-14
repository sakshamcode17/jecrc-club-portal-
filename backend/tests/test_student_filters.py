import pytest


@pytest.mark.asyncio
async def test_student_filters_by_branch_semester_and_status(admin_client):
    payloads = [
        {
            "email": "filter1@jecrc.edu.in",
            "full_name": "Filter One",
            "enrollment_no": "FIL-001",
            "branch": "CSE",
            "semester": "6",
            "is_active": True,
        },
        {
            "email": "filter2@jecrc.edu.in",
            "full_name": "Filter Two",
            "enrollment_no": "FIL-002",
            "branch": "ECE",
            "semester": "4",
            "is_active": True,
        },
        {
            "email": "filter3@jecrc.edu.in",
            "full_name": "Filter Three",
            "enrollment_no": "FIL-003",
            "branch": "CSE",
            "semester": "6",
            "is_active": False,
        },
    ]

    for payload in payloads:
        response = await admin_client.post("/api/admin/students", json=payload)
        assert response.status_code == 201

    branch_response = await admin_client.get("/api/admin/students?branch=CSE")
    assert branch_response.status_code == 200
    assert all(student["branch"] == "CSE" for student in branch_response.json())

    semester_response = await admin_client.get("/api/admin/students?semester=4")
    assert semester_response.status_code == 200
    assert len(semester_response.json()) == 1
    assert semester_response.json()[0]["email"] == "filter2@jecrc.edu.in"

    active_response = await admin_client.get("/api/admin/students?is_active=true")
    assert active_response.status_code == 200
    assert all(student["is_active"] is True for student in active_response.json())

    inactive_response = await admin_client.get("/api/admin/students?is_active=false")
    assert inactive_response.status_code == 200
    assert any(student["email"] == "filter3@jecrc.edu.in" for student in inactive_response.json())
