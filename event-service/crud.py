from sqlalchemy.orm import Session
from models import Event
from schema import EventCreate, EventUpdate
from datetime import datetime

def create_event(db: Session, event: EventCreate, organizer_id: int):
    db_event = Event(**event.model_dump(), organizer_id=organizer_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_event_by_id(db: Session, event_id: int):
    return db.query(Event).filter(Event.id == event_id).first()

def get_events(db: Session, skip: int = 0, limit: int = 100, published_only: bool = True):
    query = db.query(Event)
    if published_only:
        query = query.filter(Event.is_published == True)
    return query.offset(skip).limit(limit).all()

def get_events_by_organizer(db: Session, organizer_id: int, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.organizer_id == organizer_id).offset(skip).limit(limit).all()

def get_events_by_date(db: Session, date: datetime, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.start_date == date).offset(skip).limit(limit).all()

def get_events_by_price(db: Session, price: float, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.price == price).offset(skip).limit(limit).all()
    
def get_events_by_name(db: Session, name: str, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.name == name).offset(skip).limit(limit).all()

def get_events_by_location(db: Session, location: str, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.location == location).offset(skip).limit(limit).all()
    
def get_events_by_category(db: Session, category: str, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.category == category).offset(skip).limit(limit).all()

def update_event(db: Session, event_id: int, event_data: EventUpdate):
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None
        
    update_dict = event_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int):
    db_event = get_event_by_id(db, event_id)
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event
