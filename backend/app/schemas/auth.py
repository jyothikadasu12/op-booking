from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=255)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int | None = None


class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None
    exp: int | None = None


class AuthResponse(BaseModel):
    success: bool = True
    message: str = "Authentication successful"
    data: dict
