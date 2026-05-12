import pytest
import sys
import os

# Add the service root to path so we can import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db

# Use the DATABASE_URL from the environment (points to the test database)
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
    """Create all tables before tests, drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    """Shared test client for the session."""
    return TestClient(app)


@pytest.fixture(scope="session")
def db_session():
    """Shared DB session for direct DB assertions."""
    db = TestSessionLocal()
    yield db
    db.close()
