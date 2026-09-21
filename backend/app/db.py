import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # On Vercel / AWS Lambda, the root filesystem is read-only; use /tmp for SQLite
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        DATABASE_URL = "sqlite:////tmp/cropdb.db"
    else:
        DATABASE_URL = "sqlite:///./cropdb.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_initialized = False

def init_db():
    global _initialized
    if _initialized:
        return
    try:
        from . import models  # Register all models with Base.metadata
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from .models.crop import Crop
            if not db.query(Crop).first():
                from .seed import seed_database
                seed_database()
        finally:
            db.close()
        _initialized = True
    except Exception as e:
        print(f"init_db warning: {e}")

def get_db():
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

