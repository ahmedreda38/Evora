import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg2://db_admin:evora123@postgres-test-db:5432/evoradb_test")
engine = create_engine(DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


def make_auth_header(user_id=1, username="testuser", role="user"):
    from jose import jwt
    from datetime import datetime, timedelta, UTC
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret123123123213')
    payload = {
        "id": user_id, "username": username,
        "email": f"{username}@test.com", "role": role,
        "is_active": True,
        "exp": datetime.now(UTC) + timedelta(hours=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}
