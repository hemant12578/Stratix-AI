# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
cd server
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
    Write-Host "Virtual environment activated" -ForegroundColor Cyan
} else {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
}

Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
python main.py
