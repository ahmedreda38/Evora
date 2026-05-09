from auth import hash_password, verify_password
from  models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException
from schema import UserCreate



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