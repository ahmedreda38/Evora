from pydantic import BaseModel, ConfigDict, Field, EmailStr
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    user_id: int
    recipient_email: EmailStr
    subject: str = Field(..., examples=["Booking Confirmation"])
    message: str = Field(..., examples=["You have successfully registered for the event!"])

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    recipient_email: EmailStr
    subject: str
    message: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
