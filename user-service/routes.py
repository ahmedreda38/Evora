from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
import crud
from schema import UserCreate, UserResponse, UserLogin, TokenResponse,UserData
import auth

router = APIRouter()



@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = crud.create_user(db=db, user=user)
    
    if not new_user: 
        raise HTTPException(status_code=404,detail="Registration Failed, username or email already exist.")
    
    return new_user

@router.post("/login",response_model=TokenResponse)
def login_user(user: UserLogin, db : Session = Depends(get_db)):
    username = user.username
    password = user.password
    trying_user = crud.get_user_by_username(username=username,db=db)
    if not trying_user:
        raise HTTPException(status_code=403, detail="Login failed, Account not found.")
    pass_check = auth.verify_password(password,trying_user.password_hash)
    if not pass_check:
        raise HTTPException(status_code=403, detail="Login failed, Wrong password.")

    data = {
        "username":trying_user.username,
        "email": trying_user.email,
        "role":trying_user.role,
        "is_active":trying_user.is_active
    }

    token = auth.sign_token(data=data)
    return {"token":token,"data":data}


@router.get("/me",response_model=UserData)
def get_current_user(token: str):
    payload = auth.verify_token(token=token)
    if payload:
        return payload
    raise HTTPException(status_code=403,detail="Unauthorized to do this action")


@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user 