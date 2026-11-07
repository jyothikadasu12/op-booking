from conftest import bootstrap_admin


def _admin_token(client, admin_credentials):
    bootstrap_admin(client, admin_credentials)
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": admin_credentials["email"],
            "password": admin_credentials["password"],
        },
    )
    return response.json()["data"]["access_token"]


def test_create_service_requires_admin(client, customer_credentials):
    from conftest import register_customer

    register_customer(client, customer_credentials)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        },
    )
    token = login.json()["data"]["access_token"]
    response = client.post(
        "/api/v1/services",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Consultation",
            "description": "Basic",
            "duration_minutes": 30,
            "price": 100,
            "is_active": True,
        },
    )
    assert response.status_code == 403


def test_admin_can_create_and_list_service(client, admin_credentials):
    token = _admin_token(client, admin_credentials)
    response = client.post(
        "/api/v1/services",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Consultation",
            "description": "Basic",
            "duration_minutes": 30,
            "price": 100,
            "is_active": True,
        },
    )
    assert response.status_code == 201
    service_id = response.json()["id"]

    listing = client.get(
        "/api/v1/services", headers={"Authorization": f"Bearer {token}"}
    )
    assert listing.status_code == 200
    assert any(item["id"] == service_id for item in listing.json())


def test_update_service_status(client, admin_credentials):
    token = _admin_token(client, admin_credentials)
    create = client.post(
        "/api/v1/services",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Consultation",
            "description": "Basic",
            "duration_minutes": 30,
            "price": 100,
            "is_active": True,
        },
    )
    service_id = create.json()["id"]
    response = client.patch(
        f"/api/v1/services/{service_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": False},
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False
