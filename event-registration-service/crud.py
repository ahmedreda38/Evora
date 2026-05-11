from sqlalchemy.orm import Session
from models import Registration
import schema

def create_registration(db: Session, user_id: int, event_id: int):
    db_registration = Registration(user_id=user_id, event_id=event_id)
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration

def get_user_registrations(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Registration).filter(Registration.user_id == user_id).offset(skip).limit(limit).all()

def get_event_registrations(db: Session, event_id: int, skip: int = 0, limit: int = 100):
    return db.query(Registration).filter(Registration.event_id == event_id).offset(skip).limit(limit).all()

def get_registration(db: Session, registration_id: int):
    return db.query(Registration).filter(Registration.id == registration_id).first()

def cancel_registration(db: Session, db_registration: Registration):
    db_registration.status = "cancelled"
    db.commit()
    db.refresh(db_registration)
    return db_registration
