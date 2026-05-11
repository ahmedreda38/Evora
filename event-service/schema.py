from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime, UTC
from typing import Optional

class EventBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, examples=["Evora Annual Tech Fest 2026"])
    category: str = Field(..., min_length=3, max_length=50, examples=["Conference"])
    description: Optional[str] = Field(None, max_length=1000, examples=["A massive 3-day tech conference covering AI and Cloud Computing."])
    location: str = Field(..., min_length=3, max_length=255, examples=["Cairo International Convention Centre"])
    is_online: bool = Field(False, description="True if the event is held virtually", examples=[False])
    
    start_date: datetime = Field(..., examples=["2026-10-15T09:00:00Z"])
    end_date: datetime = Field(..., examples=["2026-10-18T18:00:00Z"])
    
    capacity: int = Field(..., ge=1, description="Maximum number of attendees allowed", examples=[500])
    price: float = Field(0.0, ge=0.0, description="Ticket price (0.0 for free events)", examples=[150.50])
    is_published: bool = Field(False, description="Whether the event is publicly visible", examples=[True])

class EventCreate(EventBase):
    @model_validator(mode='after')
    def check_dates(self) -> 'EventCreate':
        if self.start_date < datetime.now(UTC):
            raise ValueError("start_date cannot be in the past")
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date")
        return self

class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    category: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = Field(None, min_length=3, max_length=255)
    is_online: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    capacity: Optional[int] = Field(None, ge=1)
    price: Optional[float] = Field(None, ge=0.0)
    is_published: Optional[bool] = None

class EventResponse(EventBase):
    id: int
    organizer_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
