from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    model_name = Column(String, nullable=False)  # e.g., 'linear_regression', 'random_forest', etc.
    prediction_date = Column(Date, nullable=False)  # date for which prediction is made
    predicted_price = Column(Float, nullable=False)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    smape = Column(Float, nullable=True)
    r2 = Column(Float, nullable=True)

    crop = relationship("Crop", backref="predictions")
    market = relationship("Market", backref="predictions")
