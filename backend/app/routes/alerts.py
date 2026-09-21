from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import db
from ..schemas.price_alert import PriceAlertCreate, PriceAlertResponse
from ..models.price_alert import PriceAlert

router = APIRouter()

@router.get("/alerts", response_model=list[PriceAlertResponse])
async def list_alerts(user_id: int, db: Session = Depends(db.get_db)):
    return db.query(PriceAlert).filter(PriceAlert.user_id == user_id).all()

@router.post("/alerts", response_model=PriceAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(alert: PriceAlertCreate, db: Session = Depends(db.get_db)):
    db_alert = PriceAlert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.patch("/alerts/{alert_id}", response_model=PriceAlertResponse)
async def update_alert(alert_id: int, is_active: bool, db: Session = Depends(db.get_db)):
    db_alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db_alert.is_active = is_active
    db.commit()
    db.refresh(db_alert)
    return db_alert
