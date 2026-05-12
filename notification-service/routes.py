from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import crud, schema, auth

router = APIRouter()

@router.post("/send", response_model=schema.NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_notification(
    notification: schema.NotificationCreate, 
    db: Session = Depends(get_db),
    # In a real microservice architecture, this endpoint might be called internally by other services 
    # without a standard user JWT, perhaps using a service-to-service token or IP whitelisting.
    # For simplicity, we require an admin or the user themselves to send the notification.
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Sends a notification (mocked via console/db)."""
    
    # Simple authorization check
    if current_user.id != notification.user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send notifications on behalf of this user")
        
    # Mock sending logic
    print(f"--- MOCK EMAIL SENT ---")
    print(f"To: {notification.recipient_email}")
    print(f"Subject: {notification.subject}")
    print(f"Message: {notification.message}")
    print(f"-----------------------")
    
    return crud.create_notification(db=db, notification=notification)

@router.get("/me", response_model=list[schema.NotificationResponse])
def get_my_notifications(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """List all notifications sent to the currently authenticated user."""
    return crud.get_user_notifications(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/me/unread-count")
def get_my_unread_count(
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Get the number of unread notifications for the current user."""
    count = crud.get_unread_count(db, user_id=current_user.id)
    return {"count": count}

@router.put("/{notification_id}/read", response_model=schema.NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """Mark a notification as read."""
    notification = crud.get_notification(db, notification_id=notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.mark_as_read(db, notification_id=notification_id)
