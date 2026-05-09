from database import Base, engine
from models import User  # Import your model classes to register them with Base

# Create all tables
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")