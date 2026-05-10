from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Event
from schemas import EventCreate, EventUpdate, EventResponse

router = APIRouter()

@router.post("/events", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event