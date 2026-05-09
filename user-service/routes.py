from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
import crud
from schema import UserCreate, UserResponse, UserLogin
import auth

router = APIRouter()


@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user 



@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = crud.create_user(db=db, user=user)
    
    if not new_user: 
        raise HTTPException(status_code=404,detail="Registration Failed, username or email already exist.")
    
    return new_user

@router.post("/login",response_model=UserResponse)
def login_user(user: UserLogin, db : Session = Depends(get_db)):
    username = user.username
    password = user.password
    trying_user = crud.get_user_by_username(username=username,db=db)
    if not trying_user:
        raise HTTPException(status_code=403, detail="Login failed, Account not found.")
    # hashed_password = crud.hash_password(password=password)
    # print("Computed hash:" + user.password + "-" * 10 + hashed_password )
    # print(f"Target hash: {trying_user.password_hash}")
    pass_check = auth.verify_password(password,trying_user.password_hash)
    if not pass_check:
        raise HTTPException(status_code=403, detail="Login failed, Wrong password.")

    return trying_user