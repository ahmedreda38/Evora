from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from pydantic import EmailStr

 
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, examples=["Obad Zobad"])
    email: EmailStr = Field(..., min_length=6, max_length=200, examples=["obad@obad.com"])
    


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, examples=["Password123"])

class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, examples=["Password123"])
 

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, examples=["Obad Zobad"])
    password: str = Field(..., min_length=8, examples=["Password123"])


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    profile_image_url: Optional[str] = None
    date_joined: datetime


class UserData(UserBase):
    id: int
    role: str
    is_active: bool
    profile_image_url: Optional[str] = None
    date_joined: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    token: str
    data: UserData

class RoleUpdateRequest(BaseModel):
    requested_role: str = Field(..., examples=["organizer"])