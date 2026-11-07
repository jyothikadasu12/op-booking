from conftest import bootstrap_admin, register_customer


def test_register_customer(client, customer_credentials):
    response = register_customer(client, customer_credentials)
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["email"] == customer_credentials["email"]
    assert body["data"]["role"] == "customer"


def test_register_duplicate_email(client, customer_credentials):
    register_customer(client, customer_credentials)
    second = register_customer(client, customer_credentials)
    assert second.status_code == 400
    assert second.json()["success"] is False


def test_login_success(client, customer_credentials):
    register_customer(client, customer_credentials)
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["access_token"]
    assert body["data"]["user"]["email"] == customer_credentials["email"]


def test_login_invalid_password(client, customer_credentials):
    register_customer(client, customer_credentials)
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": "WrongPassword123",
        },
    )
    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_authenticated_user(client, customer_credentials):
    register_customer(client, customer_credentials)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        },
    )
    token = login.json()["data"]["access_token"]
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == customer_credentials["email"]


def test_bootstrap_admin(client, admin_credentials):
    response = bootstrap_admin(client, admin_credentials)
    assert response.status_code == 201
    assert response.json()["data"]["user"]["role"] == "admin"


def test_customer_cannot_access_admin(client, customer_credentials):
    register_customer(client, customer_credentials)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        },
    )
    token = login.json()["data"]["access_token"]
    response = client.get(
        "/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
