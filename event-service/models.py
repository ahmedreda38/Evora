from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


class Event(Base):
    __tablename__ = "events"

    id : int =  Column(Integer,primary_key=True,index=True,autoincrement=True)
    name : str = Column(String, nullable=False, index=True)
    event_type : str = Column(String, nullable=False, index=True)
    description : str = Column(String, nullable=False, index=True)
    location : str = Column(String, nullable=False, index=True)
    date_start : datetime = Column(DateTime, nullable=False, index=True)
    date_end : datetime = Column(DateTime, nullable=False, index=True)
    capacity : int = Column(Integer, nullable=False, index=True)
    organizer_id : int = Column(Integer, nullable=False, index=True)
    created_at : datetime = Column(
        DateTime, 
        nullable=False, 
        index=True, 
        default=lambda: datetime.now(UTC)
    )
    updated_at : datetime = Column(
        DateTime,
        nullable=False,
        index=True,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )
    is_published : bool = Column(Boolean, nullable=False, index=True, default=False)
    
    