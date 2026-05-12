from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone, UTC
from dotenv import load_dotenv
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret123123123213')
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/users/login')

class CurrentUser(BaseModel):
    id: int
    username: str
    email: str
    role: str

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("id")
    username = payload.get("username")
    email = payload.get("email")
    role = payload.get("role")
    
    if username is None or user_id is None:
        raise credentials_exception
        
    return CurrentUser(id=user_id, username=username, email=email, role=role)

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: CurrentUser = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user
