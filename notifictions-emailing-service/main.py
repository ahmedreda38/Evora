from fastapi import FastAPI
from routes import router as notification_router


app = FastAPI(title="Evora Notification Service", description="A microservice for handling notifications (email,SMS,in-app)", version="1.0.0")

app.include_router(notification_router, tags=["notifications"])