"""
Simplified test server for local development
Full backend runs on Render (Python 3.13.4)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Stratix AI API", version="1.0.0")

# CORS middleware
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://stratix-ai.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Stratix AI API (Local Test)", "status": "running", "note": "This is a test backend. Full backend with Gemini API runs on Render."}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/test")
async def test_endpoint():
    return {"test": "success", "message": "API is responding correctly"}

@app.get("/api/datasets")
async def datasets():
    return {
        "datasets": [
            {"id": 1, "name": "Test Dataset 1"},
            {"id": 2, "name": "Test Dataset 2"},
        ],
        "total": 2
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
