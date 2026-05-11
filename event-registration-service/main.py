from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as registration_router

app = FastAPI(title="Event Registration Service", description="Handles event ticketing and RSVPs", version="1.0.0", root_path="/register")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(registration_router, tags=["registrations"])
