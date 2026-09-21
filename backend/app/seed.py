import datetime
import random
from datetime import date, timedelta
from .db import engine, Base, SessionLocal
from .models import User, Crop, Market, CropPrice, Weather, Prediction, PriceAlert
from .utils.auth import get_password_hash

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Crop).first():
            print("Database already contains crop data. Skipping initial seeding.")
            return

        print("Seeding demo farmer user...")
        demo_user = User(
            email="farmer@tamilnadu.agri",
            hashed_password=get_password_hash("password123"),
            full_name="Selvam (விவசாயி)",
            is_active=1
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        print("Seeding crops (Tamil + English)...")
        crops_data = [
            {"name": "Paddy (Rice)", "tamil_name": "நெல்", "category": "Cereals", "base_price": 2400},
            {"name": "Tomato", "tamil_name": "தக்காளி", "category": "Vegetables", "base_price": 3200},
            {"name": "Onion (Small/Shallot)", "tamil_name": "வெங்காயம்", "category": "Vegetables", "base_price": 4500},
            {"name": "Potato", "tamil_name": "உருளைக்கிழங்கு", "category": "Vegetables", "base_price": 2800},
            {"name": "Cotton", "tamil_name": "பருத்தி", "category": "Cash Crops", "base_price": 7200},
            {"name": "Sugarcane", "tamil_name": "கரும்பு", "category": "Cash Crops", "base_price": 3100},
            {"name": "Maize", "tamil_name": "மக்காச்சோளம்", "category": "Cereals", "base_price": 2150},
            {"name": "Turmeric", "tamil_name": "மஞ்சள்", "category": "Spices", "base_price": 13500},
            {"name": "Banana (Poovan)", "tamil_name": "வாழை", "category": "Fruits", "base_price": 2600},
            {"name": "Wheat", "tamil_name": "கோதுமை", "category": "Cereals", "base_price": 2450}
        ]

        crop_instances = []
        for c in crops_data:
            crop = Crop(name=c["name"], tamil_name=c["tamil_name"], category=c["category"])
            db.add(crop)
            crop_instances.append((crop, c["base_price"]))
        db.commit()

        print("Seeding markets (Tamil Nadu mandis)...")
        markets_data = [
            {"name": "Chennai Koyambedu Mandi", "district": "Chennai"},
            {"name": "Madurai Central Market", "district": "Madurai"},
            {"name": "Coimbatore MGR Mandi", "district": "Coimbatore"},
            {"name": "Tiruchirappalli Gandhi Market", "district": "Tiruchirappalli"},
            {"name": "Salem Shevapet Market", "district": "Salem"},
            {"name": "Erode Agricultural Regulated Market", "district": "Erode"},
            {"name": "Tirunelveli Nainerkulam Market", "district": "Tirunelveli"},
            {"name": "Vellore New Bus Stand Market", "district": "Vellore"},
            {"name": "Thanjavur Kamaraj Market", "district": "Thanjavur"},
            {"name": "Dindigul Market", "district": "Dindigul"}
        ]

        market_instances = []
        for m in markets_data:
            market = Market(name=m["name"], district=m["district"], state="Tamil Nadu")
            db.add(market)
            market_instances.append(market)
        db.commit()

        print("Seeding historical AGMARKNET prices (last 60 days)...")
        today = date.today()
        varieties = ["FAQ", "Special", "Hybrid", "Local Desi", "Ponni"]

        for crop, base_price in crop_instances:
            for market in market_instances:
                # Slight market deviation factor
                market_factor = 1.0 + (random.uniform(-0.08, 0.08))
                cur_price = base_price * market_factor

                for day_offset in range(60, 0, -1):
                    record_date = today - timedelta(days=day_offset)
                    # Random daily walk with trend
                    variation = random.uniform(-0.03, 0.035)
                    cur_price = round(max(cur_price * (1.0 + variation), base_price * 0.6), 2)

                    min_p = round(cur_price * random.uniform(0.91, 0.96), 2)
                    max_p = round(cur_price * random.uniform(1.04, 1.10), 2)
                    modal_p = cur_price
                    arrival_qty = round(random.uniform(50.0, 450.0), 1)

                    db.add(CropPrice(
                        crop_id=crop.id,
                        market_id=market.id,
                        date=record_date,
                        variety=random.choice(varieties),
                        min_price=min_p,
                        max_price=max_p,
                        modal_price=modal_p,
                        arrival_quantity=arrival_qty
                    ))
        db.commit()

        print("Seeding weather records...")
        for market in market_instances:
            for day_offset in range(30, 0, -1):
                rec_date = today - timedelta(days=day_offset)
                temp = round(random.uniform(26.5, 36.5), 1)
                humidity = round(random.uniform(55.0, 85.0), 1)
                rainfall = round(random.choice([0.0, 0.0, 0.0, 1.5, 4.2, 12.0]), 1)
                db.add(Weather(
                    market_id=market.id,
                    date=rec_date,
                    temperature=temp,
                    humidity=humidity,
                    rainfall=rainfall
                ))
        db.commit()

        print("Seeding ML price predictions (Linear Regression, Random Forest, XGBoost, LSTM)...")
        models = [
            {"name": "Multiple Linear Regression", "mae": 68.4, "rmse": 89.2, "mape": 3.2, "smape": 3.1, "r2": 0.88},
            {"name": "Random Forest", "mae": 45.2, "rmse": 61.5, "mape": 2.1, "smape": 2.0, "r2": 0.94},
            {"name": "XGBoost", "mae": 38.1, "rmse": 52.8, "mape": 1.7, "smape": 1.6, "r2": 0.96},
            {"name": "LSTM", "mae": 41.3, "rmse": 56.4, "mape": 1.9, "smape": 1.8, "r2": 0.95}
        ]

        # Generate future predictions for next 7 days for top crops and markets
        for crop, base_price in crop_instances[:5]:  # Top 5 crops
            for market in market_instances[:4]:     # Top 4 markets
                for day_future in range(1, 8):
                    pred_date = today + timedelta(days=day_future)
                    for mod in models:
                        # Slight model differences reflecting realistic performance
                        model_noise = random.uniform(-0.02, 0.02)
                        pred_price = round(base_price * (1.0 + (day_future * 0.005) + model_noise), 2)
                        db.add(Prediction(
                            crop_id=crop.id,
                            market_id=market.id,
                            model_name=mod["name"],
                            prediction_date=pred_date,
                            predicted_price=pred_price,
                            mae=mod["mae"],
                            rmse=mod["rmse"],
                            mape=mod["mape"],
                            smape=mod["smape"],
                            r2=mod["r2"]
                        ))
        db.commit()

        print("Seeding sample price alerts...")
        db.add(PriceAlert(
            user_id=demo_user.id,
            crop_id=crop_instances[0][0].id,
            market_id=market_instances[0].id,
            threshold_price=2600.0,
            direction="above",
            is_active=True,
            created_at=today
        ))
        db.add(PriceAlert(
            user_id=demo_user.id,
            crop_id=crop_instances[1][0].id,
            market_id=market_instances[0].id,
            threshold_price=3500.0,
            direction="above",
            is_active=True,
            created_at=today
        ))
        db.commit()

        print("Database successfully seeded with realistic AGMARKNET agricultural data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
