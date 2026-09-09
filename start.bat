@echo off
echo ========================================================
echo   Starting UPS RiskPilot (Shipment Early-Warning System)
echo ========================================================

:: Check if virtual environment exists
if not exist ".venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv .venv
    call .\.venv\Scripts\pip install -r backend\requirements.txt
)

:: Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [2/3] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo [3/3] Launching Backend & Frontend services...

:: Launch FastAPI Backend on port 8000
start "UPS RiskPilot - Backend (FastAPI)" cmd /k ".\.venv\Scripts\python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload"

:: Launch React Vite Frontend on port 5173
start "UPS RiskPilot - Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   UPS RiskPilot is launching!
echo   - Backend API:  http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
echo   - Frontend App: http://localhost:5173
echo ========================================================
