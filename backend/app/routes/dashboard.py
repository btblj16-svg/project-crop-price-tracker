from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from .. import db
from ..models.crop_price import CropPrice
from ..models.crop import Crop
from ..models.market import Market
from ..models.weather import Weather
from ..models.prediction import Prediction
from ..models.price_alert import PriceAlert

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_data(
    user_id: Optional[int] = None,
    crop_id: Optional[int] = None,
    market_id: Optional[int] = None,
    db: Session = Depends(db.get_db)
):
    """Unified farmer dashboard endpoint returning summary statistics, market trends,
    weather data, alerts, and model prediction summaries.
    """
    total_crops = db.query(Crop).count()
    total_markets = db.query(Market).count()
    
    # Recent prices
    price_query = db.query(CropPrice).join(Crop).join(Market)
    if crop_id:
        price_query = price_query.filter(CropPrice.crop_id == crop_id)
    if market_id:
        price_query = price_query.filter(CropPrice.market_id == market_id)
    
    recent_prices_raw = price_query.order_by(desc(CropPrice.date), desc(CropPrice.id)).limit(10).all()
    recent_prices = [
        {
            "id": p.id,
            "crop_id": p.crop_id,
            "crop_name": p.crop.name,
            "crop_tamil_name": p.crop.tamil_name,
            "market_id": p.market_id,
            "market_name": p.market.name,
            "district": p.market.district,
            "variety": p.variety,
            "date": p.date.isoformat(),
            "min_price": p.min_price,
            "max_price": p.max_price,
            "modal_price": p.modal_price,
            "arrival_quantity": p.arrival_quantity
        }
        for p in recent_prices_raw
    ]

    # Weather
    weather_query = db.query(Weather).join(Market)
    if market_id:
        weather_query = weather_query.filter(Weather.market_id == market_id)
    recent_weather_raw = weather_query.order_by(desc(Weather.date), desc(Weather.id)).limit(5).all()
    recent_weather = [
        {
            "id": w.id,
            "market_id": w.market_id,
            "market_name": w.market.name,
            "district": w.market.district,
            "date": w.date.isoformat(),
            "temperature": w.temperature,
            "rainfall": w.rainfall,
            "humidity": w.humidity,
            "condition": "Cloudy" if (w.rainfall or 0) > 2 else "Sunny" if (w.temperature or 0) > 30 else "Moderate"
        }
        for w in recent_weather_raw
    ]

    # Predictions
    pred_query = db.query(Prediction).join(Crop).join(Market)
    if crop_id:
        pred_query = pred_query.filter(Prediction.crop_id == crop_id)
    if market_id:
        pred_query = pred_query.filter(Prediction.market_id == market_id)
    recent_preds_raw = pred_query.order_by(desc(Prediction.prediction_date), desc(Prediction.id)).limit(8).all()
    recent_predictions = [
        {
            "id": pr.id,
            "crop_id": pr.crop_id,
            "crop_name": pr.crop.name,
            "market_id": pr.market_id,
            "market_name": pr.market.name,
            "model_name": pr.model_name,
            "prediction_date": pr.prediction_date.isoformat(),
            "predicted_price": pr.predicted_price,
            "mae": pr.mae,
            "rmse": pr.rmse,
            "mape": pr.mape,
            "r2": pr.r2
        }
        for pr in recent_preds_raw
    ]

    # Alerts
    alerts = []
    if user_id:
        user_alerts = (
            db.query(PriceAlert)
            .join(Crop)
            .join(Market)
            .filter(PriceAlert.user_id == user_id, PriceAlert.is_active == True)
            .all()
        )
        alerts = [
            {
                "id": a.id,
                "crop_name": a.crop.name,
                "market_name": a.market.name,
                "threshold_price": a.threshold_price,
                "direction": a.direction,
                "is_active": a.is_active,
                "created_at": a.created_at.isoformat()
            }
            for a in user_alerts
        ]

    # Calculate average modal price from recent prices
    avg_price = (
        round(sum(p["modal_price"] for p in recent_prices if p["modal_price"]) / len(recent_prices), 2)
        if recent_prices else 0
    )

    return {
        "stats": {
            "total_crops": total_crops,
            "total_markets": total_markets,
            "average_modal_price": avg_price,
            "active_alerts_count": len(alerts)
        },
        "recent_prices": recent_prices,
        "recent_weather": recent_weather,
        "recent_predictions": recent_predictions,
        "alerts": alerts
    }
