from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class WeatherBase(BaseModel):
    market_id: int
    date: date
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None

class WeatherCreate(WeatherBase):
    pass

class WeatherResponse(WeatherBase):
    id: int
    market_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
