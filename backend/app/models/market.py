from sqlalchemy import Column, Integer, String
from ..db import Base

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    district = Column(String, nullable=True)
    state = Column(String, default="Tamil Nadu")
