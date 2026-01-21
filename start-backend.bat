@echo off
echo Starting Stratix AI Backend...
cd server
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt >nul 2>&1
python main.py
