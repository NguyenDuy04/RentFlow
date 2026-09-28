from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.common import PyObjectId


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserInDB(UserBase):
    id: PyObjectId = Field(validation_alias="_id")
    hashed_password: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class UserPublic(UserBase):
    id: PyObjectId = Field(validation_alias="_id")
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
