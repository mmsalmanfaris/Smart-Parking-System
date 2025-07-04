from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Admin Modal
class userModal(BaseModel):
    name: str

class vehicleModal(BaseModel):
    vehicle_brand: str
    vehicle_model: str
    car_color: str
    plate_number: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None


class vehicleResponse(vehicleModal):
    id: str
    user: Optional[userModal] = None

    class Config:
        from_attributes = True


# User Modal

class vehicle_Response(vehicleModal):
    id: str

    class Config:
        from_attributes = True