# Railway Deployment - Complete Setup

## ✅ All Three Options Implemented

### Option 1: Railway Dashboard Settings
In your Railway dashboard, set:
- **Builder:** `DOCKERFILE` (not Railpack)
- **Dockerfile Path:** `server/Dockerfile`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Healthcheck Path:** `/health`

### Option 2: Railway Config File
Created `railway-deploy.json` - rename to `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "cd server && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```

### Option 3: Dockerfile in Server Directory
✅ Copied Dockerfile to `server/Dockerfile`
✅ Updated paths to work from server directory
✅ Removed `cd server` from start command

## Files Created/Updated:
1. `railway-deploy.json` → rename to `railway.json`
2. `server/Dockerfile` → optimized for server directory
3. Updated root `Dockerfile` still available

## Next Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add complete Railway deployment setup"
   git push origin main
   ```

2. **In Railway Dashboard:**
   - Builder: `DOCKERFILE`
   - Dockerfile Path: `server/Dockerfile`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   GEMINI_API_KEY=your_gemini_api_key
   STORAGE_DIR=./data/temp
   ```

Railway will now use your Dockerfile instead of Railpack! 🚀
