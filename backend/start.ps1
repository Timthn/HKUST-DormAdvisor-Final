# HKUST Dorm Advisor - Backend Startup Script

Write-Host "[BACKEND] Checking environment..." -ForegroundColor Blue

# Create venv if not exists
if (!(Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt -q

# Check .env
if (!(Test-Path ".env")) {
    Write-Host "Warning: .env not found. Copying from .env.example" -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please edit backend\.env with your API keys, then run again." -ForegroundColor Red
    exit 1
}

Write-Host "Starting backend server at http://localhost:8000" -ForegroundColor Green
python app/main.py
