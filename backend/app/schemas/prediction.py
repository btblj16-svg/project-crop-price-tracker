from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class PredictionBase(BaseModel):
    crop_id: int
    market_id: int
    model_name: str  # e.g., 'linear_regression', 'random_forest', 'xgboost', 'lstm'
    prediction_date: date
    predicted_price: float
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    smape: Optional[float] = None
    r2: Optional[float] = None

class PredictionCreate(PredictionBase):
    pass

class PredictionResponse(PredictionBase):
    id: int
    crop_name: Optional[str] = None
    market_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
