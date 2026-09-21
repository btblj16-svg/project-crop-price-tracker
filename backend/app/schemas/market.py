from pydantic import BaseModel, ConfigDict
from typing import Optional

class MarketBase(BaseModel):
    name: str
    district: Optional[str] = None
    state: Optional[str] = "Tamil Nadu"

class MarketCreate(MarketBase):
    pass

class MarketResponse(MarketBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
