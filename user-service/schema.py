from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from pydantic import EmailStr

 
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: EmailStr = Field(..., min_length=6, max_length=200, example="[EMAIL_ADDRESS]")
    role: str = Field(..., min_length=3, max_length=50, example="admin")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="SecurePassword123")

class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, example="SecurePassword123")
 

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    password: str = Field(..., min_length=8, example="SecurePassword123")


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    date_joined: datetime


class UserData(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool


class TokenResponse(BaseModel):
    token: str
    data: UserData