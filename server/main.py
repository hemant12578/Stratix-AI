from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import sys
import uuid
from typing import Optional, List
from pathlib import Path

os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")

# Add the server directory to sys.path for imports
# This works whether running from project root or from server directory
server_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(server_dir))

from app.api import analyze, search, process, download, datasets, user, strategy, admin
from app.core.config import settings
from app.core.firebase_admin_client import initialize_firebase_admin

app = FastAPI(title="Stratix AI API", version="1.0.0")

# Initialize Firebase Admin if credentials are available.
initialize_firebase_admin()

# CORS middleware - Updated for production
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
allow_origin_regex = r"https://.*\.vercel\.app"

# Allow origin from environment variable for flexibility
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(datasets.router, prefix="/api", tags=["datasets"])
app.include_router(user.router, prefix="/api", tags=["user"])
app.include_router(process.router, prefix="/api", tags=["process"])
app.include_router(download.router, prefix="/api", tags=["download"])
app.include_router(strategy.router, prefix="/api", tags=["strategy"])
app.include_router(admin.router, prefix="/api", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Stratix AI API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
