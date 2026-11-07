from fastapi import APIRouter

from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.availability import router as availability_router
from app.api.v1.endpoints.bookings import router as bookings_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.providers import router as providers_router
from app.api.v1.endpoints.services import router as services_router
from app.api.v1.endpoints.users import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(services_router)
api_router.include_router(providers_router)
api_router.include_router(availability_router)
api_router.include_router(bookings_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
