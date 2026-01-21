@echo off
echo Starting Stratix AI...
echo.
echo Starting Backend in new window...
start "Stratix Backend" cmd /k start-backend.bat
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend in new window...
start "Stratix Frontend" cmd /k start-frontend.bat
echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
