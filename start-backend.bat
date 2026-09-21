@echo off
title Crop Price Tracker - Backend Server
echo Starting FastAPI Backend on http://127.0.0.1:8000...
call .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
pause
