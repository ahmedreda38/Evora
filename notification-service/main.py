from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as notification_router

app = FastAPI(title="Notification Service", description="Handles emails and internal notifications", version="1.0.0", root_path="/notifications")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notification_router, tags=["notifications"])