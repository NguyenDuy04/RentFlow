from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class SetupStatusResponse(BaseModel):
    needs_setup: bool
