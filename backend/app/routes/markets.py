from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import db
from ..schemas.market import MarketCreate, MarketResponse
from ..models.market import Market

router = APIRouter()

@router.get("/markets", response_model=list[MarketResponse])
async def list_markets(db: Session = Depends(db.get_db)):
    return db.query(Market).all()

@router.post("/markets", response_model=MarketResponse, status_code=status.HTTP_201_CREATED)
async def create_market(market: MarketCreate, db: Session = Depends(db.get_db)):
    existing = db.query(Market).filter(Market.name == market.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Market already exists")
    db_market = Market(name=market.name)
    db.add(db_market)
    db.commit()
    db.refresh(db_market)
    return db_market
