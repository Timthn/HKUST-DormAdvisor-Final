# HKUST Dorm Advisor - Frontend Startup Script

Write-Host "[FRONTEND] Checking environment..." -ForegroundColor Blue

# Install dependencies if needed
if (!(Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check .env.local
if (!(Test-Path ".env.local")) {
    Write-Host "Warning: .env.local not found. Copying from .env.local.example" -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "Please edit frontend\.env.local (set NEXT_PUBLIC_DEV_MODE=true for local testing), then run again." -ForegroundColor Red
    exit 1
}

Write-Host "Starting frontend dev server at http://localhost:3000" -ForegroundColor Green
npm run dev
