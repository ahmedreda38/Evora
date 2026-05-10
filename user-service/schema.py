from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: str = Field(..., min_length=6, max_length=200, example="john.doe@example.com")
    role: str = Field(..., min_length=3, max_length=50, example="admin")


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: str = Field(..., min_length=6, max_length=200, example="john.doe@example.com")
    password: str = Field(..., min_length=8, example="SecurePassword123")

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100, example="John Doe")
    email: Optional[str] = Field(None, min_length=6, max_length=200, example="john.doe@example.com")
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