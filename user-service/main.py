from fastapi import FastAPI
from routes import router as user_router


app = FastAPI(title="User Service", description="A microservice for managing users", version="1.0.0")

app.include_router(user_router, prefix="/users", tags=["users"])