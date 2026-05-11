from fastapi import FastAPI
from routes import router as event_router

app = FastAPI(title="Event Service", description="A microservice for managing events", version="1.0.0", root_path="/events")

app.include_router(event_router, tags=["events"])