from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class CropPriceBase(BaseModel):
    crop_id: int
    market_id: int
    date: date
    variety: Optional[str] = "Common"
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    modal_price: Optional[float] = None
    arrival_quantity: Optional[float] = None

class CropPriceCreate(CropPriceBase):
    pass

class CropPriceResponse(CropPriceBase):
    id: int
    crop_name: Optional[str] = None
    crop_tamil_name: Optional[str] = None
    market_name: Optional[str] = None
    market_district: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
