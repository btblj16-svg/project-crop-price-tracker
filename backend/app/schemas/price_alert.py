from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class PriceAlertBase(BaseModel):
    crop_id: int
    market_id: int
    threshold_price: float
    direction: str  # 'above' or 'below'
    is_active: Optional[bool] = True

class PriceAlertCreate(PriceAlertBase):
    user_id: int

class PriceAlertResponse(PriceAlertBase):
    id: int
    user_id: int
    created_at: date
    crop_name: Optional[str] = None
    market_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
