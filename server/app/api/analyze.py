from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.gemini_service import analyze_requirement

router = APIRouter()

class AnalyzeRequest(BaseModel):
    user_query: str

@router.post("/analyze")
async def analyze_user_requirement(request: AnalyzeRequest):
    """Analyze user's natural language requirement"""
    try:
        result = analyze_requirement(request.user_query)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
