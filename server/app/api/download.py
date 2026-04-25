from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import zipfile
from app.core.config import settings

router = APIRouter()

def _build_zip_archive(base_path: str, zip_path: str) -> None:
    """Build a fresh ZIP archive from available outputs."""
    temp_zip_path = f"{zip_path}.tmp"
    with zipfile.ZipFile(temp_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for ext in ["csv", "json"]:
            for split in ["train", "test", "val"]:
                file_path = f"{base_path}_{split}.{ext}"
                if os.path.exists(file_path):
                    zipf.write(file_path, f"{split}.{ext}")

        metadata_path = f"{base_path}_metadata.json"
        code_path = f"{base_path}_training_code.py"
        if os.path.exists(metadata_path):
            zipf.write(metadata_path, "metadata.json")
        if os.path.exists(code_path):
            zipf.write(code_path, "training_code.py")

    os.replace(temp_zip_path, zip_path)

def _zip_is_valid(zip_path: str) -> bool:
    """Return True if zip exists and has at least one file."""
    if not os.path.exists(zip_path):
        return False
    if os.path.getsize(zip_path) == 0:
        return False
    try:
        with zipfile.ZipFile(zip_path, "r") as zipf:
            return len(zipf.namelist()) > 0 and zipf.testzip() is None
    except Exception:
        return False

@router.get("/download/{job_id}")
async def download_file(job_id: str, file_type: str = "zip", format: str = ""):
    """Download processed files"""
    base_path = os.path.join(settings.STORAGE_DIR, job_id)
    
    # Check if job exists
    if not os.path.exists(base_path + "_metadata.json"):
        raise HTTPException(status_code=404, detail="Job not found or not completed")
    
    if file_type == "zip":
        file_path = f"{base_path}.zip"
        filename = f"stratix_{job_id}.zip"
        # Always rebuild if missing/corrupt/empty so users don't get blank zips.
        if not _zip_is_valid(file_path):
            _build_zip_archive(base_path, file_path)
            if not _zip_is_valid(file_path):
                raise HTTPException(status_code=500, detail="Failed to create a valid ZIP archive")
    elif file_type == "train":
        csv_path = f"{base_path}_train.csv"
        json_path = f"{base_path}_train.json"
        prefer = (format or "").lower()
        if prefer == "json" and os.path.exists(json_path):
            file_path = json_path
            filename = "train.json"
        elif prefer == "csv" and os.path.exists(csv_path):
            file_path = csv_path
            filename = "train.csv"
        elif os.path.exists(csv_path):
            file_path = csv_path
            filename = "train.csv"
        elif os.path.exists(json_path):
            file_path = json_path
            filename = "train.json"
        else:
            raise HTTPException(status_code=404, detail="Train file not found")
    elif file_type == "test":
        csv_path = f"{base_path}_test.csv"
        json_path = f"{base_path}_test.json"
        prefer = (format or "").lower()
        if prefer == "json" and os.path.exists(json_path):
            file_path = json_path
            filename = "test.json"
        elif prefer == "csv" and os.path.exists(csv_path):
            file_path = csv_path
            filename = "test.csv"
        elif os.path.exists(csv_path):
            file_path = csv_path
            filename = "test.csv"
        elif os.path.exists(json_path):
            file_path = json_path
            filename = "test.json"
        else:
            raise HTTPException(status_code=404, detail="Test file not found")
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
    
    ext = os.path.splitext(file_path)[1].lower()
    media_type = {
        ".zip": "application/octet-stream",  # Force download instead of preview
        ".csv": "text/csv",
        ".json": "application/json",
        ".py": "text/x-python",
    }.get(ext, "application/octet-stream")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"
        }
    )
