import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers (they will be created subsequently)
from .routes import auth, crops, markets, prices, predictions, weather, alerts, dashboard

app = FastAPI(title="Real-Time Crop Price Tracker API", version="0.1.0", redirect_slashes=False)

# CORS configuration - allow all origins for development; restrict in production
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with common /api prefix
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(crops.router, prefix="/api", tags=["crops"])
app.include_router(markets.router, prefix="/api", tags=["markets"])
app.include_router(prices.router, prefix="/api", tags=["prices"])
app.include_router(predictions.router, prefix="/api", tags=["predictions"])
app.include_router(weather.router, prefix="/api", tags=["weather"])
app.include_router(alerts.router, prefix="/api", tags=["alerts"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

# Also include without prefix as fallback in case a serverless adapter strips /api
app.include_router(auth.router, tags=["auth"])
app.include_router(crops.router, tags=["crops"])
app.include_router(markets.router, tags=["markets"])
app.include_router(prices.router, tags=["prices"])
app.include_router(predictions.router, tags=["predictions"])
app.include_router(weather.router, tags=["weather"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(dashboard.router, tags=["dashboard"])

@app.on_event("startup")
def on_startup():
    from .seed import seed_database
    try:
        seed_database()
    except Exception as e:
        print(f"Startup DB init warning: {e}")

@app.get("/api")
@app.get("/")
async def root():
    return {
        "message": "Real-Time Crop Price Tracker API is running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/api/health")
@app.get("/health")
async def health_check():
    return {"status": "ok"}


