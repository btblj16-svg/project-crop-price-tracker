from sqlalchemy import Column, Integer, String
from ..db import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    tamil_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
