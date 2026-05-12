from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routes import router as user_router


app = FastAPI(title="User Service", description="A microservice for managing users", version="1.0.0", root_path="/users")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving profile images
uploads_dir = Path("/app/uploads/profiles")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads/profiles", StaticFiles(directory=str(uploads_dir)), name="profile-uploads")

app.include_router(user_router, tags=["users"])
