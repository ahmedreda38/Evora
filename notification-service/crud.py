from sqlalchemy.orm import Session
from models import Notification
import schema

def create_notification(db: Session, notification: schema.NotificationCreate):
    db_notification = Notification(
        user_id=notification.user_id,
        recipient_email=notification.recipient_email,
        subject=notification.subject,
        message=notification.message,
        status="sent" # In a real app, this might be 'pending' until a worker sends it
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Notification).filter(Notification.user_id == user_id).offset(skip).limit(limit).all()

def get_notification(db: Session, notification_id: int):
    return db.query(Notification).filter(Notification.id == notification_id).first()
