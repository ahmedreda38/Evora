from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

# here we define how should the api respond and what should it recieve

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: str = Field(..., min_length=6, max_length=200, example="john.doe@example.com")
    role: str = Field(..., min_length=3, max_length=50, example="admin")

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    email: str = Field(..., min_length=6, max_length=200, example="john.doe@example.com")
    password: str = Field(..., min_length=8, example="SecurePassword123")


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="John Doe")
    password: str = Field(..., min_length=8, example="SecurePassword123")


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True) # this tell pydantic to read data from the ORM model attributes instead of expecting a dict
    
    id : int
    username: str 
    email: str
    role: str
    is_active: bool 
    date_joined: datetime 