import secrets
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserLogin
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path=settings.COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        path=settings.COOKIE_PATH,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.register_user(payload)
    return {
        "success": True,
        "message": "Registration successful",
        "data": UserResponse.model_validate(user).model_dump(mode="json"),
    }


@router.post("/login")
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.authenticate_user(str(payload.email), payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token, refresh_token = service.issue_tokens(user)
    _set_refresh_cookie(response, refresh_token)

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        },
    }


@router.post("/token")
def oauth_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    response: Response = None,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    user = service.authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    access_token, refresh_token = service.issue_tokens(user)
    if response is not None:
        _set_refresh_cookie(response, refresh_token)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh")
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(
        default=None, alias=settings.REFRESH_TOKEN_COOKIE_NAME
    ),
):
    service = AuthService(db)
    user, access_token, new_refresh_token = service.refresh_session(refresh_token)
    _set_refresh_cookie(response, new_refresh_token)

    return {
        "success": True,
        "message": "Token refreshed",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        },
    }


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(
        default=None, alias=settings.REFRESH_TOKEN_COOKIE_NAME
    ),
):
    service = AuthService(db)
    service.logout(refresh_token)
    _clear_refresh_cookie(response)

    return {"success": True, "message": "Logout successful", "data": None}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/bootstrap-admin", status_code=status.HTTP_201_CREATED)
def bootstrap_admin(
    payload: UserCreate,
    response: Response,
    db: Session = Depends(get_db),
    x_admin_setup_secret: Annotated[str | None, Header(alias="X-Admin-Setup-Secret")] = None,
):
    service = AuthService(db)
    user, access_token, refresh_token = service.bootstrap_admin(
        payload, x_admin_setup_secret or ""
    )
    _set_refresh_cookie(response, refresh_token)

    return {
        "success": True,
        "message": "Administrator created successfully",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        },
    }
