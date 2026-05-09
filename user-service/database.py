from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from os import getenv
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the current directory
# env_path = Path(__file__).parent / ".env"
# load_dotenv(dotenv_path=env_path)

# SQL_CONNECTION = getenv("DATABASE_URL")

SQL_CONNECTION = "postgresql+psycopg2://db_admin:evora123@localhost:5432/evoradb"

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