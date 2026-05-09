from passlib.context import CryptContext

from jose import JWTError, jwt
from datetime import datetime, timedelta,timezone,UTC
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.environ['SECRET_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def sign_token(data: dict, expire_time : timedelta | None = None ):
    to_encode = data.copy()
    if expire_time:
        expire = datetime.now(UTC) + expire_time
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp":expire})
    encoded_token = jwt.encode(to_encode,SECRET_KEY,ALGORITHM)

    return encoded_token

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
