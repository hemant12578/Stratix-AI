from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.core.dataset_service import search_datasets
from app.core.gemini_service import analyze_requirement

router = APIRouter()

@router.get("/search")
async def search_datasets_endpoint(
    query: str = Query(..., description="Search query"),
    limit: int = Query(20, ge=1, le=100)
):
    """Search for datasets matching the query using Gemini AI"""
    try:
        # Analyze the query to get structured requirements
        requirements = analyze_requirement(query)
        
        # Search for datasets using Gemini AI
        datasets = await search_datasets(query, limit=limit)
        
        return {
            "status": "success",
            "query": query,
            "requirements": requirements,
            "matches": datasets,
            "recommended_combinations": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
