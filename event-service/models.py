from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=False)
    is_online = Column(Boolean, default=False, nullable=False)
    
    start_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=False)
    
    capacity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    
    organizer_id = Column(Integer, nullable=False, index=True) # Linked to User ID
    is_published = Column(Boolean, nullable=False, default=False, index=True)
    image_url = Column(String(500), nullable=True)  # Path to uploaded background image
    
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime, 
        nullable=False, 
        default=lambda: datetime.now(UTC), 
        onupdate=lambda: datetime.now(UTC)
    )