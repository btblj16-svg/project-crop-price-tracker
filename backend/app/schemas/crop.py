from pydantic import BaseModel, ConfigDict
from typing import Optional

class CropBase(BaseModel):
    name: str
    tamil_name: Optional[str] = None
    category: Optional[str] = None

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
