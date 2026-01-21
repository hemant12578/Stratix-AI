@echo off
echo Starting Stratix AI Frontend...
cd client
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
call npm run dev
