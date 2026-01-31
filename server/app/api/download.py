from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import zipfile
from app.core.config import settings

router = APIRouter()

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
        # Create ZIP on-demand if it doesn't exist
        if not os.path.exists(file_path):
            # Rebuild ZIP from available files
            with zipfile.ZipFile(file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for ext in ["csv", "json"]:
                    for split in ["train", "test", "val"]:
                        file = f"{base_path}_{split}.{ext}"
                        if os.path.exists(file):
                            zipf.write(file, f"{split}.{ext}")
                # Add metadata and code
                if os.path.exists(f"{base_path}_metadata.json"):
                    zipf.write(f"{base_path}_metadata.json", "metadata.json")
                if os.path.exists(f"{base_path}_training_code.py"):
                    zipf.write(f"{base_path}_training_code.py", "training_code.py")
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
