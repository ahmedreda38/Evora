from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as event_router

app = FastAPI(title="Event Service", description="A microservice for managing events", version="1.0.0", root_path="/events")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event_router, tags=["events"])