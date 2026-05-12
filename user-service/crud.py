from auth import hash_password, verify_password
from  models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException
from schema import UserCreate, UserUpdate



def get_user_by_id(db: Session , user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # check if other user has the same username or email
    if get_user_by_username(db,user.username) or get_user_by_email(db,user.email):
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = hash_password(user.password)
    new_user = User(
        username = user.username,
        password_hash = hashed_password,
        email = user.email
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def update_user(db: Session, user_id: int, user_data: UserUpdate):
    user_to_update = get_user_by_id(db,user_id)
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.username:
        existing = get_user_by_username(db, user_data.username)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Username already taken")
    if user_data.email:
        existing = get_user_by_email(db, user_data.email)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Email already taken")
    
    if user_data.username:
        user_to_update.username = user_data.username
    if user_data.email:
        user_to_update.email = user_data.email
    if user_data.password:
        user_to_update.password_hash = hash_password(user_data.password)
    
    db.commit()
    db.refresh(user_to_update)
    return user_to_update

def get_all_users(db: Session):
    return db.query(User).all()

def get_users_by_role(db: Session , role: str):
    return db.query(User).filter(User.role == role).all()

def delete_user(db: Session, user_id: int):
    user_to_delete = get_user_by_id(db, user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user_to_delete)
    db.commit()
    return {"message": "User deleted successfully"}

def update_role(db: Session, user_id:int , new_role: str):
    user_to_update = get_user_by_id(db,user_id)
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    if new_role not in ["admin","user","organizer","volenteer","sponsor"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user_to_update.role = new_role
    db.commit()
    db.refresh(user_to_update)
    return user_to_update

