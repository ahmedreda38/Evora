from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class RegistrationBase(BaseModel):
    event_id: int = Field(..., examples=[1])

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationResponse(RegistrationBase):
    id: int
    user_id: int
    status: str = Field(..., examples=["confirmed"])
    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)
