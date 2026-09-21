from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import db
from ..schemas.crop import CropCreate, CropResponse
from ..models.crop import Crop

router = APIRouter()

@router.get("/crops", response_model=list[CropResponse])
async def list_crops(db: Session = Depends(db.get_db)):
    return db.query(Crop).order_by(Crop.name.asc()).all()

@router.post("/crops", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
async def create_crop(crop: CropCreate, db: Session = Depends(db.get_db)):
    existing = db.query(Crop).filter(Crop.name == crop.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Crop already exists")
    db_crop = Crop(name=crop.name, tamil_name=crop.tamil_name, category=crop.category)
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop
