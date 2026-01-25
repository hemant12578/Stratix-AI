from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import sys
import uuid
from typing import Optional, List
from pathlib import Path

# Add the server directory to sys.path for imports
# This works whether running from project root or from server directory
server_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(server_dir))

from app.api import analyze, search, process, download, datasets, user, strategy
from app.core.config import settings

app = FastAPI(title="Stratix AI API", version="1.0.0")

# CORS middleware - Updated for production
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://stratix-ai.netlify.app",  # Your Netlify frontend URL
]

# Allow origin from environment variable for flexibility
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

@app.get("/")
async def root():
    return {"message": "Stratix AI API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
