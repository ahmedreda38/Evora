from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
from database import get_db
import crud, schema, auth
from sqlalchemy.exc import IntegrityError

router = APIRouter()

EVENT_SERVICE_URL = "http://event-service:8000"

@router.post("/", response_model=schema.RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    registration: schema.RegistrationCreate, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Register for an event. Verifies event existence and capacity via Event Service."""
    
    # 1. Synchronous internal call to verify the event
    try:
        response = httpx.get(f"{EVENT_SERVICE_URL}/{registration.event_id}", timeout=5.0)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Event Service is unavailable")
        
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to verify event")
        
    event_data = response.json()
    
    # 2. Check capacity (Note: A real-world app needs distributed locking here!)
    # We check if existing confirmed registrations are less than capacity
    current_registrations = crud.get_event_registrations(db, event_id=registration.event_id)
    confirmed_count = sum(1 for r in current_registrations if r.status == "confirmed")
    
    if confirmed_count >= event_data.get("capacity", 0):
        raise HTTPException(status_code=400, detail="Event is sold out!")
        
    # 3. Create the registration
    try:
        return crud.create_registration(db=db, user_id=current_user.id, event_id=registration.event_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="You are already registered for this event")

@router.get("/me", response_model=list[schema.RegistrationResponse])
def get_my_registrations(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """List all registrations for the currently authenticated user."""
    return crud.get_user_registrations(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/event/{event_id}", response_model=list[schema.RegistrationResponse])
def get_event_attendees(
    event_id: int,
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """List all attendees for an event. Only the event organizer can do this."""
    # Internal call to verify ownership
    try:
        response = httpx.get(f"{EVENT_SERVICE_URL}/{event_id}", timeout=5.0)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Event Service is unavailable")
        
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event_data = response.json()
    
    if event_data.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not the organizer of this event")
        
    return crud.get_event_registrations(db, event_id=event_id, skip=skip, limit=limit)

@router.delete("/{registration_id}", response_model=schema.RegistrationResponse)
def cancel_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Cancel a registration."""
    db_registration = crud.get_registration(db, registration_id=registration_id)
    
    if db_registration is None:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    if db_registration.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this registration")
        
    if db_registration.status == "cancelled":
        raise HTTPException(status_code=400, detail="Registration is already cancelled")
        
    return crud.cancel_registration(db, db_registration)
