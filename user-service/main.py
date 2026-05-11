from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as user_router


app = FastAPI(title="User Service", description="A microservice for managing users", version="1.0.0", root_path="/users")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, tags=["users"])
