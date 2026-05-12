from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pathlib import Path
from sqlalchemy.orm import Session
from database import get_db
import crud, schema
import auth

router = APIRouter()

@router.post("/", response_model=schema.EventResponse, status_code=status.HTTP_201_CREATED)
def create_new_event(
    event: schema.EventCreate, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Create a new event. Requires authentication."""
    # current_user is provided statelessly by the auth.py JWT decoder
    return crud.create_event(db=db, event=event, organizer_id=current_user.id)

@router.get("/", response_model=list[schema.EventResponse])
def read_all_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all published events. Publicly accessible."""
    return crud.get_events(db=db, skip=skip, limit=limit, published_only=True)

@router.get("/search/category/{category}", response_model=list[schema.EventResponse])
def search_events_by_category(category: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_events_by_category(db=db, category=category, skip=skip, limit=limit)

@router.get("/search/location/{location}", response_model=list[schema.EventResponse])
def search_events_by_location(location: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_events_by_location(db=db, location=location, skip=skip, limit=limit)

@router.get("/search/price/{price}", response_model=list[schema.EventResponse])
def search_events_by_price(price: float, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_events_by_price(db=db, price=price, skip=skip, limit=limit)

@router.get("/search/organizer/{organizer_id}", response_model=list[schema.EventResponse])
def search_events_by_organizer(organizer_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_events_by_organizer(db=db, organizer_id=organizer_id, skip=skip, limit=limit)

@router.get("/{event_id}", response_model=schema.EventResponse)
def read_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID."""
    db_event = crud.get_event_by_id(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.put("/{event_id}", response_model=schema.EventResponse)
def update_existing_event(
    event_id: int, 
    event_data: schema.EventUpdate, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Update an event. Only the organizer or an admin can do this."""
    db_event = crud.get_event_by_id(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if db_event.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    return crud.update_event(db=db, event_id=event_id, event_data=event_data)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_event(
    event_id: int, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Delete an event. Only the organizer or an admin can do this."""
    db_event = crud.get_event_by_id(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if db_event.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    crud.delete_event(db=db, event_id=event_id)
    return None


@router.post("/{event_id}/image", response_model=schema.EventResponse)
def upload_event_image(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Upload a background image for an event. Only the organizer can upload."""
    db_event = crud.get_event_by_id(db, event_id=event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    if db_event.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed)}")

    # Validate file size (max 2MB)
    contents = file.file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 2MB.")
    file.file.seek(0)

    # Save file
    import uuid
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"event_{event_id}_{uuid.uuid4().hex[:8]}.{ext}"
    upload_dir = Path("/app/uploads/events")
    upload_dir.mkdir(parents=True, exist_ok=True)
    filepath = upload_dir / filename

    with open(filepath, "wb") as f:
        f.write(contents)

    # Update event with image URL
    image_url = f"/uploads/events/{filename}"
    db_event.image_url = image_url
    db.commit()
    db.refresh(db_event)
    return db_event