from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean, UniqueConstraint
from database import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    event_id = Column(Integer, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="confirmed") # confirmed, cancelled
    
    registered_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))

    __table_args__ = (
        UniqueConstraint('user_id', 'event_id', name='uix_user_event_registration'),
    )
