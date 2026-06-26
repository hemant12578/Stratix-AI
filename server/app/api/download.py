from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from app.core.config import settings

router = APIRouter()

@router.get("/download/{job_id}")
async def download_file(job_id: str, file_type: str = "zip"):
    """Download processed files"""
    base_path = os.path.join(settings.STORAGE_DIR, job_id)
    
    if file_type == "zip":
        file_path = f"{base_path}.zip"
        filename = f"stratix_{job_id}.zip"
    elif file_type == "train":
        file_path = f"{base_path}_train.csv"
        filename = "train.csv"
    elif file_type == "test":
        file_path = f"{base_path}_test.csv"
        filename = "test.csv"
    elif file_type == "metadata":
        file_path = f"{base_path}_metadata.json"
        filename = "metadata.json"
    elif file_type == "code":
        file_path = f"{base_path}_training_code.py"
        filename = "training_code.py"
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = {
        "zip": "application/zip",
        "csv": "text/csv",
        "json": "application/json",
        "py": "text/x-python"
    }.get(file_type.split("_")[0] if "_" in file_type else file_type, "application/octet-stream")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )
