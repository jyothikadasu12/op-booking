import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Configure tests to use the isolated PostgreSQL test database.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://postgres:1215@localhost:5432/service_booking_test_db",
)
os.environ.setdefault("APP_ENV", "testing")
os.environ.setdefault("DEBUG", "False")
os.environ.setdefault("SECRET_KEY", "TEST_SECRET_KEY_CHANGE_ME_1234567890")
os.environ.setdefault("ADMIN_SETUP_SECRET", "TEST_ADMIN_SETUP_SECRET")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.main import app

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session", autouse=True)
def create_test_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def reset_test_database():
    yield
    db = SessionLocal()
    try:
        table_names = ", ".join(
            f'"{table.name}"' for table in reversed(Base.metadata.sorted_tables)
        )
        if table_names:
            db.execute(__import__("sqlalchemy").text(f"TRUNCATE {table_names} CASCADE"))
            db.commit()
    finally:
        db.close()


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_credentials():
    return {
        "full_name": "Test Admin",
        "email": "testadmin@example.com",
        "password": "AdminPass123",
        "phone": "1234567890",
    }


@pytest.fixture
def customer_credentials():
    return {
        "full_name": "Test Customer",
        "email": "testcustomer@example.com",
        "password": "CustomerPass123",
        "phone": "9876543210",
    }


def bootstrap_admin(client, credentials, setup_secret="TEST_ADMIN_SETUP_SECRET"):
    return client.post(
        "/api/v1/auth/bootstrap-admin",
        headers={"X-Admin-Setup-Secret": setup_secret},
        json={
            "full_name": credentials["full_name"],
            "email": credentials["email"],
            "password": credentials["password"],
            "phone": credentials["phone"],
        },
    )


def register_customer(client, credentials):
    return client.post(
        "/api/v1/auth/register",
        json={
            "full_name": credentials["full_name"],
            "email": credentials["email"],
            "password": credentials["password"],
            "phone": credentials["phone"],
        },
    )
