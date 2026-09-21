from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from .. import db
from ..schemas.prediction import PredictionCreate, PredictionResponse
from ..models.prediction import Prediction
from ..models.crop import Crop
from ..models.market import Market

router = APIRouter()

def format_prediction_response(pred: Prediction) -> dict:
    return {
        "id": pred.id,
        "crop_id": pred.crop_id,
        "market_id": pred.market_id,
        "model_name": pred.model_name,
        "prediction_date": pred.prediction_date,
        "predicted_price": pred.predicted_price,
        "mae": pred.mae,
        "rmse": pred.rmse,
        "mape": pred.mape,
        "smape": pred.smape,
        "r2": pred.r2,
        "crop_name": pred.crop.name if pred.crop else None,
        "market_name": pred.market.name if pred.market else None,
    }

@router.get("/predictions", response_model=list[PredictionResponse])
async def list_predictions(
    crop_id: Optional[int] = None,
    market_id: Optional[int] = None,
    model_name: Optional[str] = None,
    db: Session = Depends(db.get_db)
):
    query = db.query(Prediction).join(Crop).join(Market)
    if crop_id is not None:
        query = query.filter(Prediction.crop_id == crop_id)
    if market_id is not None:
        query = query.filter(Prediction.market_id == market_id)
    if model_name is not None:
        query = query.filter(Prediction.model_name == model_name)
    
    preds = query.order_by(Prediction.prediction_date.asc(), desc(Prediction.id)).all()
    return [format_prediction_response(p) for p in preds]

@router.get("/predictions/compare-models")
async def compare_models(
    crop_id: int,
    market_id: int,
    db: Session = Depends(db.get_db)
):
    """Compare all 4 ML models (Linear Regression, Random Forest, XGBoost, LSTM) for a specific crop and market."""
    models = ["Multiple Linear Regression", "Random Forest", "XGBoost", "LSTM"]
    comparison = []
    for m in models:
        latest = (
            db.query(Prediction)
            .filter(
                Prediction.crop_id == crop_id,
                Prediction.market_id == market_id,
                Prediction.model_name == m
            )
            .order_by(desc(Prediction.prediction_date), desc(Prediction.id))
            .first()
        )
        if latest:
            comparison.append(format_prediction_response(latest))
    return comparison

@router.get("/predictions/forecast")
async def get_dynamic_forecast(
    crop_id: int,
    market_id: int,
    days: int = Query(7, ge=1, le=14),
    db: Session = Depends(db.get_db)
):
    """Dynamically train and forecast crop prices using Multiple Linear Regression,
    Random Forest, XGBoost, and LSTM on real AGMARKNET price records.
    """
    from ..models.crop_price import CropPrice
    from ..ml.engine import train_and_forecast_crop

    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    market = db.query(Market).filter(Market.id == market_id).first()
    if not crop or not market:
        raise HTTPException(status_code=404, detail="Crop or Market not found")

    records = (
        db.query(CropPrice)
        .filter(CropPrice.crop_id == crop_id, CropPrice.market_id == market_id)
        .order_by(CropPrice.date.asc())
        .all()
    )

    records_data = [
        {"date": r.date.isoformat(), "modal_price": r.modal_price}
        for r in records
    ]

    forecast_results = train_and_forecast_crop(records_data, forecast_days=days)
    return {
        "crop_id": crop.id,
        "crop_name": crop.name,
        "crop_tamil_name": crop.tamil_name,
        "market_id": market.id,
        "market_name": market.name,
        "models": forecast_results
    }

@router.post("/predictions", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(pred: PredictionCreate, db: Session = Depends(db.get_db)):
    db_pred = Prediction(**pred.model_dump())
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    return format_prediction_response(db_pred)
