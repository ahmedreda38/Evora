from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"
    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String(255), unique=True, index=True, nullable=False)
    email: str = Column(String(255), unique=True, index=True, nullable=False)
    password_hash: str = Column(String, nullable=False)
    role: str = Column(String(50), nullable=False, default="user")
    is_active: bool = Column(Boolean, default=True)
    date_joined: datetime = Column(DateTime, default=lambda: datetime.now(UTC))