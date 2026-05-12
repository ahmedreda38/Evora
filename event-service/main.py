from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routes import router as event_router

app = FastAPI(title="Event Service", description="A microservice for managing events", version="1.0.0", root_path="/events")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving uploaded event images
uploads_dir = Path("/app/uploads/events")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads/events", StaticFiles(directory=str(uploads_dir)), name="event-uploads")

app.include_router(event_router, tags=["events"])