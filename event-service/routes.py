from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud, schema, models
import auth
import requests

router = APIRouter()

# Define your API endpoints here
# @router.get("/")
# def example_route():
#     return {"message": "Hello from Event Service"}

@router.get("/")
def check_users():
    return requests.get("http://user-service:8000/Ay7aga").text