from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from os import getenv
from dotenv import load_dotenv
from pathlib import Path
import os
# Load .env from the current directory
# env_path = Path(__file__).parent / ".env"
load_dotenv()

# SQL_CONNECTION = getenv("DATABASE_URL")

SQL_CONNECTION = os.environ['DATABASE_URL']

if not SQL_CONNECTION:
    raise ValueError("DATABASE_URL environment variable is not set in .env file")

engine = create_engine(SQL_CONNECTION)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    with SessionLocal() as db:
        try:
            yield db
        finally:
            db.close()