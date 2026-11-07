from datetime import datetime, timedelta, timezone

from conftest import bootstrap_admin, register_customer


def _make_admin(client, admin_credentials):
    bootstrap_admin(client, admin_credentials)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": admin_credentials["email"],
            "password": admin_credentials["password"],
        },
    )
    return login.json()["data"]["access_token"]


def _make_customer(client, customer_credentials):
    register_customer(client, customer_credentials)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": customer_credentials["email"],
            "password": customer_credentials["password"],
        },
    )
    return login.json()["data"]["access_token"]


def _create_slot(client, admin_token, service_id=1, provider_id=1, capacity=2):
    start = (datetime.now(timezone.utc) + timedelta(days=5)).replace(microsecond=0)
    end = start + timedelta(minutes=30)

    # Ensure base service and provider exist.
    services = client.get(
        "/api/v1/services", headers={"Authorization": f"Bearer {admin_token}"}
    ).json()
    if not services:
        service_response = client.post(
            "/api/v1/services",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "Consultation",
                "description": "Basic",
                "duration_minutes": 30,
                "price": 100,
                "is_active": True,
            },
        )
        service_id = service_response.json()["id"]
    else:
        service_id = services[0]["id"]

    providers = client.get(
        "/api/v1/providers", headers={"Authorization": f"Bearer {admin_token}"}
    ).json()
    if not providers:
        provider_response = client.post(
            "/api/v1/providers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "full_name": "Dr. Smith",
                "specialization": "General",
                "is_active": True,
            },
        )
        provider_id = provider_response.json()["id"]
    else:
        provider_id = providers[0]["id"]

    response = client.post(
        "/api/v1/availability",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "service_id": service_id,
            "provider_id": provider_id,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "capacity": capacity,
            "is_active": True,
        },
    )
    return response, service_id, provider_id


def test_create_booking_success(client, admin_credentials, customer_credentials):
    admin_token = _make_admin(client, admin_credentials)
    customer_token = _make_customer(client, customer_credentials)
    slot_response, service_id, provider_id = _create_slot(client, admin_token)
    assert slot_response.status_code == 201
    slot_id = slot_response.json()["id"]

    response = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"slot_id": slot_id, "reason": "Checkup"},
    )
    assert response.status_code == 201
    assert response.json()["status"] == "confirmed"
    assert response.json()["booking_reference"].startswith("BK-")


def test_duplicate_booking_rejected(client, admin_credentials, customer_credentials):
    admin_token = _make_admin(client, admin_credentials)
    customer_token = _make_customer(client, customer_credentials)
    slot_response, service_id, provider_id = _create_slot(client, admin_token, capacity=5)
    slot_id = slot_response.json()["id"]

    first = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"slot_id": slot_id, "reason": "First"},
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"slot_id": slot_id, "reason": "Second"},
    )
    assert second.status_code == 409


def test_booking_capacity_enforced(client, admin_credentials, customer_credentials):
    admin_token = _make_admin(client, admin_credentials)
    slot_response, service_id, provider_id = _create_slot(
        client, admin_token, capacity=1
    )
    slot_id = slot_response.json()["id"]

    # First customer books.
    customer_one = {
        "full_name": "Customer One",
        "email": "customerone@example.com",
        "password": "CustomerPass123",
        "phone": "1111111111",
    }
    from conftest import register_customer

    register_customer(client, customer_one)
    login_one = client.post(
        "/api/v1/auth/login",
        json={"email": customer_one["email"], "password": customer_one["password"]},
    )
    token_one = login_one.json()["data"]["access_token"]

    booking_one = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {token_one}"},
        json={"slot_id": slot_id, "reason": "First"},
    )
    assert booking_one.status_code == 201

    # Second customer attempts to book the same single-capacity slot.
    customer_two = {
        "full_name": "Customer Two",
        "email": "customertwo@example.com",
        "password": "CustomerPass123",
        "phone": "2222222222",
    }
    register_customer(client, customer_two)
    login_two = client.post(
        "/api/v1/auth/login",
        json={"email": customer_two["email"], "password": customer_two["password"]},
    )
    token_two = login_two.json()["data"]["access_token"]

    booking_two = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {token_two}"},
        json={"slot_id": slot_id, "reason": "Second"},
    )
    assert booking_two.status_code == 409


def test_cancel_booking_releases_capacity(client, admin_credentials, customer_credentials):
    admin_token = _make_admin(client, admin_credentials)
    customer_token = _make_customer(client, customer_credentials)
    slot_response, service_id, provider_id = _create_slot(client, admin_token, capacity=1)
    slot_id = slot_response.json()["id"]

    booking = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"slot_id": slot_id, "reason": "Cancel me"},
    )
    assert booking.status_code == 201
    booking_id = booking.json()["id"]

    cancel = client.patch(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"reason": "Changed plans"},
    )
    assert cancel.status_code == 200
    assert cancel.json()["status"] == "cancelled"

    # Capacity is available again; a new booking can be created.
    second_customer = {
        "full_name": "Second Customer",
        "email": "secondcustomer@example.com",
        "password": "CustomerPass123",
        "phone": "3333333333",
    }
    register_customer(client, second_customer)
    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": second_customer["email"],
            "password": second_customer["password"],
        },
    )
    second_token = login.json()["data"]["access_token"]
    second_booking = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {second_token}"},
        json={"slot_id": slot_id, "reason": "After cancellation"},
    )
    assert second_booking.status_code == 201
