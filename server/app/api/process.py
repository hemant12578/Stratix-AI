from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
import json
import zipfile
import pandas as pd
from datetime import datetime

from app.core.dataset_service import load_dataset_by_id
from app.core.processor import DataProcessor
from app.core.gemini_service import (
    generate_cleaning_strategy,
    generate_metadata,
    generate_training_code
)
from app.core.config import settings

router = APIRouter()

class ProcessRequest(BaseModel):
    dataset_ids: List[str]
    requirements: Dict[str, Any]
    job_id: Optional[str] = None

# Store job status
job_status = {}

async def process_data_task(job_id: str, dataset_ids: List[str], requirements: Dict[str, Any]):
    """Background task to process datasets"""
    try:
        job_status[job_id] = {"status": "processing", "progress": 0, "message": "Starting..."}
        
        # Step 1: Load datasets
        job_status[job_id]["message"] = "Downloading datasets..."
        job_status[job_id]["progress"] = 10
        
        dfs = []
        for ds_id in dataset_ids:
            df = await load_dataset_by_id(ds_id)
            if df is not None and not df.empty:
                dfs.append(df)
        
        if not dfs:
            raise Exception("No datasets could be loaded")
        
        # Step 2: Merge datasets if multiple
        job_status[job_id]["message"] = "Merging datasets..."
        job_status[job_id]["progress"] = 30
        
        if len(dfs) > 1:
            # Simple concatenation for now
            combined_df = pd.concat(dfs, ignore_index=True)
        else:
            combined_df = dfs[0]
        
        # Step 3: Generate cleaning strategy
        job_status[job_id]["message"] = "Analyzing data structure..."
        job_status[job_id]["progress"] = 40
        
        processor = DataProcessor(combined_df)
        stats = processor.get_statistics()
        sample = processor.get_sample(5)
        
        cleaning_strategy = generate_cleaning_strategy(
            column_names=stats["columns"],
            dtypes=stats["dtypes"],
            missing_report=stats["missing_values"],
            sample_data=sample,
            describe_stats=stats["describe"],
            user_requirements=requirements
        )
        
        # Step 4: Apply cleaning
        job_status[job_id]["message"] = "Cleaning and formatting data..."
        job_status[job_id]["progress"] = 60
        
        cleaned_df = processor.apply_cleaning(cleaning_strategy)
        
        # Step 5: Create splits
        job_status[job_id]["message"] = "Creating train/test splits..."
        job_status[job_id]["progress"] = 70
        
        split_config = requirements.get("data_split", {"train": 0.7, "test": 0.2, "validation": 0.1})
        train_df, test_df, val_df = processor.create_splits(
            train_ratio=split_config.get("train", 0.7),
            test_ratio=split_config.get("test", 0.2),
            val_ratio=split_config.get("validation", 0.1)
        )
        
        # Step 6: Generate metadata
        job_status[job_id]["message"] = "Generating metadata..."
        job_status[job_id]["progress"] = 80
        
        final_stats = processor.get_statistics()
        metadata = generate_metadata(
            rows=len(cleaned_df),
            cols=len(cleaned_df.columns),
            column_list=final_stats["columns"],
            sample_rows=processor.get_sample(10),
            describe_output=final_stats["describe"]
        )
        
        # Step 7: Generate training code
        job_status[job_id]["message"] = "Generating training code..."
        job_status[job_id]["progress"] = 90
        
        ml_framework = requirements.get("ml_framework", "sklearn")
        task_type = requirements.get("task_type", "classification")
        training_code = generate_training_code(metadata, ml_framework, task_type)
        if isinstance(training_code, str):
            training_code = training_code.replace("\ufeff", "")
        
        # Step 8: Save files
        job_status[job_id]["message"] = "Saving files..."
        job_status[job_id]["progress"] = 95
        
        os.makedirs(settings.STORAGE_DIR, exist_ok=True)
        base_path = os.path.join(settings.STORAGE_DIR, job_id)
        
        # Save output files
        output_format = requirements.get("output_format", "csv")
        if output_format in ["csv", "both"]:
            train_df.to_csv(f"{base_path}_train.csv", index=False)
            test_df.to_csv(f"{base_path}_test.csv", index=False)
            if not val_df.empty:
                val_df.to_csv(f"{base_path}_val.csv", index=False)
        if output_format in ["json", "both"]:
            train_df.to_json(f"{base_path}_train.json", orient="records", indent=2)
            test_df.to_json(f"{base_path}_test.json", orient="records", indent=2)
            if not val_df.empty:
                val_df.to_json(f"{base_path}_val.json", orient="records", indent=2)
        
        # Save metadata
        with open(f"{base_path}_metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        # Save training code
        with open(f"{base_path}_training_code.py", "w", encoding="utf-8") as f:
            f.write(training_code)
        
        # Create ZIP file
        zip_path = f"{base_path}.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            if output_format == "both":
                zipf.write(f"{base_path}_train.csv", "train.csv")
                zipf.write(f"{base_path}_test.csv", "test.csv")
                if not val_df.empty:
                    zipf.write(f"{base_path}_val.csv", "val.csv")
                zipf.write(f"{base_path}_train.json", "train.json")
                zipf.write(f"{base_path}_test.json", "test.json")
                if not val_df.empty:
                    zipf.write(f"{base_path}_val.json", "val.json")
            else:
                zipf.write(f"{base_path}_train.{output_format}", f"train.{output_format}")
                zipf.write(f"{base_path}_test.{output_format}", f"test.{output_format}")
                if not val_df.empty:
                    zipf.write(f"{base_path}_val.{output_format}", f"val.{output_format}")
            zipf.write(f"{base_path}_metadata.json", "metadata.json")
            zipf.write(f"{base_path}_training_code.py", "training_code.py")
        
        # Update job status
        job_status[job_id] = {
            "status": "completed",
            "progress": 100,
            "message": "Processing complete!",
            "output_format": output_format,
            "files": {
                "zip": zip_path,
                "train": f"{base_path}_train.csv" if output_format == "both" else f"{base_path}_train.{output_format}",
                "test": f"{base_path}_test.csv" if output_format == "both" else f"{base_path}_test.{output_format}",
                "metadata": f"{base_path}_metadata.json",
                "code": f"{base_path}_training_code.py"
            },
            "metadata": metadata,
            "stats": {
                "train_samples": len(train_df),
                "test_samples": len(test_df),
                "val_samples": len(val_df) if not val_df.empty else 0,
                "total_features": len(cleaned_df.columns)
            }
        }
        
    except Exception as e:
        job_status[job_id] = {
            "status": "failed",
            "progress": 0,
            "message": f"Error: {str(e)}",
            "error": str(e)
        }

@router.post("/process")
async def process_datasets(request: ProcessRequest, background_tasks: BackgroundTasks):
    """Start processing datasets"""
    job_id = request.job_id or str(uuid.uuid4())
    
    # Initialize job status
    job_status[job_id] = {
        "status": "queued",
        "progress": 0,
        "message": "Job queued..."
    }
    
    # Start background task
    background_tasks.add_task(process_data_task, job_id, request.dataset_ids, request.requirements)
    
    return {
        "status": "success",
        "job_id": job_id,
        "message": "Processing started"
    }

@router.get("/process/status/{job_id}")
async def get_process_status(job_id: str):
    """Get processing status"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_status[job_id]
