from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="sent") # sent, failed, pending
    
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))