from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.dataset_service import search_datasets, load_dataset_by_id

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}
    limit: int = 20

@router.post("/datasets/search")
async def search_datasets_endpoint(request: SearchRequest):
    """Search for datasets using AI API"""
    try:
        results = await search_datasets(request.query, request.limit)
        return {
            "status": "success",
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get dataset by ID"""
    try:
        df = await load_dataset_by_id(dataset_id)
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "shape": {
                "rows": len(df),
                "columns": len(df.columns)
            },
            "columns": list(df.columns),
            "sample": df.head(10).to_dict('records')
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
