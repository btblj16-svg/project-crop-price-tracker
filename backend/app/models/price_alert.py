from sqlalchemy import Column, Integer, Float, Date, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from ..db import Base

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    threshold_price = Column(Float, nullable=False)
    direction = Column(String, nullable=False)  # 'above' or 'below'
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, nullable=False)

    user = relationship("User", backref="price_alerts")
    crop = relationship("Crop", backref="price_alerts")
    market = relationship("Market", backref="price_alerts")
