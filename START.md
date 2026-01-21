# How to Run Frontend and Backend

## Option 1: Run in Separate Terminal Windows (Recommended)

### Terminal 1 - Backend (FastAPI)
```powershell
cd "d:\New folder (3)\server"
.\venv\Scripts\Activate.ps1
python main.py
```
Backend will run on: **http://localhost:8000**

### Terminal 2 - Frontend (React/Vite)
```powershell
cd "d:\New folder (3)\client"
npm run dev
```
Frontend will run on: **http://localhost:5173**

---

## Option 2: Run Both in Background (PowerShell)

### Start Backend:
```powershell
cd "d:\New folder (3)\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\Activate.ps1; python main.py"
```

### Start Frontend:
```powershell
cd "d:\New folder (3)\client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## Option 3: Use the Start Scripts

Run the provided PowerShell scripts:
- `start-backend.ps1` - Starts the backend server
- `start-frontend.ps1` - Starts the frontend server
- `start-both.ps1` - Starts both servers in separate windows

---

## Verify Everything is Running

1. **Backend Health Check**: Open http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. **Frontend**: Open http://localhost:5173
   - Should show the Stratix AI landing page

3. **API Docs**: Open http://localhost:8000/docs
   - Should show FastAPI interactive documentation

---

## Troubleshooting

- **Backend not starting**: Make sure virtual environment is activated and dependencies are installed
- **Frontend not connecting**: Check that backend is running on port 8000
- **Port already in use**: Change ports in `server/main.py` (backend) or `client/vite.config.js` (frontend)
