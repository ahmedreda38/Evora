from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # External references
    user_id = Column(Integer, nullable=True, index=True)
    event_id = Column(Integer, nullable=True, index=True)
    registration_id = Column(Integer, nullable=True, index=True)

    # email, sms, in_app
    channel = Column(String(50), nullable=False)

    recipient = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)

    # pending, sent, failed
    status = Column(String(50), nullable=False, default="pending")
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))