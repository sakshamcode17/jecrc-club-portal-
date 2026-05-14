import pytest


@pytest.mark.asyncio
async def test_student_login_with_generated_credentials(admin_client, client):
    create_payload = {
        "email": "generated_login@jecrc.edu.in",
        "full_name": "Generated Login",
        "enrollment_no": "GEN-100",
        "branch": "CSE",
        "semester": "5",
        "is_active": True,
    }

    create_response = await admin_client.post("/api/admin/students", json=create_payload)
    assert create_response.status_code == 201

    created = create_response.json()
    assert created["generated_username"] == "GEN-100"
    assert created["login_identifier"] == "generated_login@jecrc.edu.in"
    assert created["generated_password"]

    login_response = await client.post(
        "/api/auth/login",
        data={
            "username": created["login_identifier"],
            "password": created["generated_password"],
        },
    )
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    me_response = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "generated_login@jecrc.edu.in"
    assert me_response.json()["is_admin"] is False
