from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.core.gemini_service import analyze_market_strategy

router = APIRouter()


class StrategyRequest(BaseModel):
  query: str


@router.post("/strategy/analyze")
async def analyze_strategy(request: StrategyRequest) -> Dict[str, Any]:
  """
  Analyze a business idea / market query for the Strategy Hub.
  Returns consumer gap, revenue model, and SWOT analysis.
  """
  if not request.query.strip():
    raise HTTPException(status_code=400, detail="Query cannot be empty")

  try:
    result = analyze_market_strategy(request.query)
    return {"status": "success", "data": result}
  except ValueError as e:
    raise HTTPException(status_code=503, detail=str(e))
  except Exception as e:
    import traceback
    print("Strategy Hub error:", traceback.format_exc())
    raise HTTPException(status_code=500, detail=f"Strategy error: {e}")

