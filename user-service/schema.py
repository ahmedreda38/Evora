from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from pydantic import EmailStr

 
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="Obad Zobad")
    email: EmailStr = Field(..., min_length=6, max_length=200, example="obad@obad.com")
    


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="Password123")

class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, example="Password123")
 

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="Obad Zobad")
    password: str = Field(..., min_length=8, example="Password123")


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    date_joined: datetime


class UserData(UserBase):
    id: int
    role: str
    is_active: bool
    date_joined: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    token: str
    data: UserData