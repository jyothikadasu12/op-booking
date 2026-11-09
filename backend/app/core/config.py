
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "OP Booking API"
    APP_ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = (
        "postgresql://postgres:CHANGE_ME@localhost:5432/service_booking_db"
    )

    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET"
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = "http://localhost:5173"

    ADMIN_SETUP_SECRET: str = ""

    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_PATH: str = "/api/v1/auth"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
