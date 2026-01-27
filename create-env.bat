@echo off
echo Creating .env file for Stratix AI...
echo.
echo Please enter your Gemini API key:
set /p API_KEY="API Key: "
echo.
echo GEMINI_API_KEY=%AIzaSyBbBB-VfWMQhE95QEt6bBMaVVIFHII637k% > server\.env
echo STORAGE_DIR=./data/temp >> server\.env
echo.
echo ✅ .env file created in server directory!
echo.
pause
