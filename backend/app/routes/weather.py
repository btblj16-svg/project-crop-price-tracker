from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import db
from ..schemas.weather import WeatherCreate, WeatherResponse
from ..models.weather import Weather

router = APIRouter()

@router.get("/weather", response_model=list[WeatherResponse])
async def get_weather(db: Session = Depends(db.get_db)):
    return db.query(Weather).all()

@router.post("/weather", response_model=WeatherResponse, status_code=status.HTTP_201_CREATED)
async def add_weather(entry: WeatherCreate, db: Session = Depends(db.get_db)):
    db_entry = Weather(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
