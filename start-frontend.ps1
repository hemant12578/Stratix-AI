# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Green
cd client

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173" -ForegroundColor Green
npm run dev
