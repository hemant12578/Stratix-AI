# Start Both Frontend and Backend
Write-Host "Starting Stratix AI Platform..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1; python main.py } else { Write-Host 'Virtual environment not found. Please run: cd server; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt' }"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
