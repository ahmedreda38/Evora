from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from database import get_db
from models import User
import crud
from schema import UserCreate, UserResponse, UserLogin, TokenResponse, UserData, UserUpdate
import auth
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = crud.create_user(db=db, user=user)
    
    if not new_user: 
        raise HTTPException(status_code=404,detail="Registration Failed, username or email already exist.")
    
    return new_user

@router.post("/login", response_model=TokenResponse)
def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db : Session = Depends(get_db)):
    username = form_data.username
    password = form_data.password
    trying_user = crud.get_user_by_username(username=username,db=db)
    if not trying_user:
        raise HTTPException(status_code=403, detail="Login failed, Account not found.")
    pass_check = auth.verify_password(password,trying_user.password_hash)
    if not pass_check:
        raise HTTPException(status_code=403, detail="Login failed, Wrong password.")
    
    data = {
        "id": trying_user.id,
        "username": trying_user.username,
        "email": trying_user.email,
        "role": trying_user.role,
        "is_active": trying_user.is_active,
        "date_joined":str(trying_user.date_joined)
    }

    token = auth.sign_token(data=data)

    return {
        "access_token": token,
        "token_type": "bearer",
        "token": token,
        "data": data
    }


@router.get("/me", response_model=UserData)
def get_current_user_info(current_user: User = Depends(auth.get_current_user)):
    return current_user
    
@router.put("/me", response_model=UserData)
def update_current_user(user_data: UserUpdate, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    updated_user = crud.update_user(db=db, user_id=current_user.id, user_data=user_data)
    return updated_user

@router.get("/get/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/admin", response_model=UserData)
def get_admin_data(current_user: User = Depends(auth.RoleChecker(["admin"]))):
    return current_user

@router.get("/Ay7aga")
def ayhaga(request: Request):
    return request.headers

