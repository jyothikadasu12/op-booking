import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.refresh_tokens = RefreshTokenRepository(db)

    def register_user(self, payload: UserCreate) -> User:
        existing_user = self.users.get_by_email(str(payload.email))
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        try:
            user = self.users.create(
                full_name=payload.full_name,
                email=str(payload.email),
                password_hash=hash_password(payload.password),
                phone=payload.phone,
                role="customer",
            )
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            ) from exc

        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str) -> User | None:
        user = self.users.get_by_email(email)
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def issue_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_access_token(user.id, user.role)
        raw_refresh_token = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        self.refresh_tokens.create(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=expires_at,
        )
        self.db.commit()
        return access_token, raw_refresh_token

    def refresh_session(
        self, raw_refresh_token: str | None
    ) -> tuple[User, str, str]:
        if not raw_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing refresh token",
            )

        token_hash = hash_refresh_token(raw_refresh_token)
        record = self.refresh_tokens.get_by_hash(token_hash)
        now = datetime.now(timezone.utc)

        if (
            record is None
            or record.revoked_at is not None
            or record.expires_at < now
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        user = self.users.get_by_id(record.user_id)
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        self.refresh_tokens.revoke(record)
        access_token, new_refresh_token = self.issue_tokens(user)
        return user, access_token, new_refresh_token

    def logout(self, raw_refresh_token: str | None) -> None:
        if not raw_refresh_token:
            return
        record = self.refresh_tokens.get_by_hash(hash_refresh_token(raw_refresh_token))
        if record is not None and record.revoked_at is None:
            self.refresh_tokens.revoke(record)
            self.db.commit()

    def bootstrap_admin(self, payload: UserCreate, provided_secret: str):
        if not settings.ADMIN_SETUP_SECRET or not secrets.compare_digest(
            settings.ADMIN_SETUP_SECRET, provided_secret
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or disabled admin setup secret",
            )

        if self.users.count_admins() > 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="An administrator already exists",
            )

        existing_user = self.users.get_by_email(str(payload.email))
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        try:
            user = self.users.create(
                full_name=payload.full_name,
                email=str(payload.email),
                password_hash=hash_password(payload.password),
                phone=payload.phone,
                role="admin",
            )
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            ) from exc

        self.db.refresh(user)
        access_token, refresh_token = self.issue_tokens(user)
        return user, access_token, refresh_token
