from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from .. import db
from ..schemas.crop_price import CropPriceCreate, CropPriceResponse
from ..models.crop_price import CropPrice
from ..models.crop import Crop
from ..models.market import Market

router = APIRouter()

def format_price_response(price: CropPrice) -> dict:
    return {
        "id": price.id,
        "crop_id": price.crop_id,
        "market_id": price.market_id,
        "date": price.date,
        "variety": price.variety,
        "min_price": price.min_price,
        "max_price": price.max_price,
        "modal_price": price.modal_price,
        "arrival_quantity": price.arrival_quantity,
        "crop_name": price.crop.name if price.crop else None,
        "crop_tamil_name": price.crop.tamil_name if price.crop else None,
        "market_name": price.market.name if price.market else None,
        "market_district": price.market.district if price.market else None,
    }

@router.get("/prices/current", response_model=list[CropPriceResponse])
async def get_current_prices(
    crop_id: Optional[int] = None,
    market_id: Optional[int] = None,
    db: Session = Depends(db.get_db)
):
    query = db.query(CropPrice).join(Crop).join(Market)
    if crop_id:
        query = query.filter(CropPrice.crop_id == crop_id)
    if market_id:
        query = query.filter(CropPrice.market_id == market_id)
    
    # Order by date descending to get the latest records
    prices = query.order_by(desc(CropPrice.date), desc(CropPrice.id)).limit(100).all()
    return [format_price_response(p) for p in prices]

@router.get("/prices/history", response_model=list[CropPriceResponse])
async def get_price_history(
    crop_id: int,
    market_id: Optional[int] = None,
    limit: int = Query(60, ge=1, le=365),
    db: Session = Depends(db.get_db)
):
    query = db.query(CropPrice).join(Crop).join(Market).filter(CropPrice.crop_id == crop_id)
    if market_id:
        query = query.filter(CropPrice.market_id == market_id)
    
    prices = query.order_by(CropPrice.date.asc()).limit(limit).all()
    return [format_price_response(p) for p in prices]

@router.get("/prices/compare", response_model=list[CropPriceResponse])
async def compare_prices(
    crop_id: int,
    db: Session = Depends(db.get_db)
):
    # Fetch latest price for each market for this crop
    markets = db.query(Market).all()
    result = []
    for m in markets:
        latest = (
            db.query(CropPrice)
            .join(Crop)
            .join(Market)
            .filter(CropPrice.crop_id == crop_id, CropPrice.market_id == m.id)
            .order_by(desc(CropPrice.date), desc(CropPrice.id))
            .first()
        )
        if latest:
            result.append(format_price_response(latest))
    return result

@router.post("/prices", response_model=CropPriceResponse, status_code=status.HTTP_201_CREATED)
async def add_price(price: CropPriceCreate, db: Session = Depends(db.get_db)):
    db_price = CropPrice(**price.model_dump())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return format_price_response(db_price)
