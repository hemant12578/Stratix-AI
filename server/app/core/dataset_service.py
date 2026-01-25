"""
Dataset search and retrieval service
Integrates with Google AI API and Gemini for dataset search
"""
import os
import httpx
from typing import List, Dict, Any, Optional
import pandas as pd
from app.core.config import settings
import google.genai as genai

# Initialize Gemini with API key (will be configured when first used)
def get_gemini_model():
    """Get configured Gemini model"""
    api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY
    if not api_key or api_key == "your-api-key":
        raise ValueError("Google API key not configured. Please set GOOGLE_API_KEY environment variable.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')

async def search_datasets(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Search for datasets using Gemini AI"""
    try:
        model = get_gemini_model()
        
        prompt = f"""You are a dataset search expert. Search for real ML datasets matching this query: "{query}"

Return a JSON array of real, existing datasets. Use actual dataset names from Kaggle, HuggingFace, UCI ML Repository, etc.

Return format:
[
  {{
    "id": "dataset_unique_id",
    "name": "Real Dataset Name",
    "source": "kaggle|huggingface|uci|data_gov|other",
    "description": "Accurate description of the dataset",
    "sample_count": 10000,
    "quality_score": 85,
    "license": "CC0|MIT|Apache|Public Domain|Unknown",
    "tags": ["tag1", "tag2"],
    "features": ["feature1", "feature2"],
    "url": "https://real-dataset-url.com",
    "match_score": 95,
    "match_reasons": ["why it matches"],
    "concerns": []
  }}
]

Return up to {limit} real datasets. Sort by match_score descending.
Return ONLY valid JSON array, no explanations or markdown.
"""
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )
        
        import json
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        results = json.loads(response_text)
        
        # Ensure it's a list
        if isinstance(results, dict):
            if "datasets" in results:
                results = results["datasets"]
            elif "results" in results:
                results = results["results"]
            else:
                results = [results]
        elif not isinstance(results, list):
            results = [results] if results else []
        
        # Ensure all required fields
        for item in results:
            if "id" not in item:
                item["id"] = f"ds_{hash(item.get('name', ''))}"
            if "match_score" not in item:
                item["match_score"] = item.get("quality_score", 80)
            if "match_reasons" not in item:
                item["match_reasons"] = []
            if "concerns" not in item:
                item["concerns"] = []
        
        return results[:limit]
        
    except json.JSONDecodeError as e:
        import traceback
        print(f"JSON Decode Error: {e}")
        print(f"Response text: {response_text[:500] if 'response_text' in locals() else 'N/A'}")
        raise Exception(f"Invalid JSON response from AI: {str(e)}")
    except ValueError as e:
        if "API key" in str(e):
            raise Exception("Google API key not configured. Please set GOOGLE_API_KEY in environment variables.")
        raise Exception(f"Configuration error: {str(e)}")
    except Exception as e:
        import traceback
        print(f"Search error: {e}")
        print(traceback.format_exc())
        raise Exception(f"Error searching datasets with AI: {str(e)}")

async def load_dataset_by_id(dataset_id: str) -> Optional[pd.DataFrame]:
    """Load a dataset by ID - uses HuggingFace or direct URL"""
    try:
        # Try HuggingFace first if it's an HF dataset
        if dataset_id.startswith("hf_") or "/" in dataset_id:
            try:
                from datasets import load_dataset
                hf_name = dataset_id.replace("hf_", "").replace("_", "/")
                dataset = load_dataset(hf_name, split="train")
                df = dataset.to_pandas()
                return df
            except:
                pass
        
        # Try to load from URL if dataset_id is a URL
        if dataset_id.startswith("http"):
            async with httpx.AsyncClient() as client:
                response = await client.get(dataset_id, timeout=120.0)
                response.raise_for_status()
                
                if dataset_id.endswith(".csv"):
                    import io
                    df = pd.read_csv(io.StringIO(response.text))
                    return df
                elif dataset_id.endswith(".json"):
                    import io
                    df = pd.read_json(io.StringIO(response.text))
                    return df
        
        # Use Gemini to get dataset URL/info
        model = get_gemini_model()
        prompt = f"""
Get download URL or information for dataset ID: {dataset_id}

Return JSON:
{{
  "url": "https://dataset-download-url.com/data.csv",
  "format": "csv|json|parquet"
}}

If you can't find it, return {{"error": "Dataset not found"}}
Return ONLY valid JSON.
"""
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )
        
        import json
        data = json.loads(response.text)
        
        if "url" in data:
            async with httpx.AsyncClient() as client:
                download_response = await client.get(data["url"], timeout=120.0)
                download_response.raise_for_status()
                
                if data["url"].endswith(".csv") or data.get("format") == "csv":
                    import io
                    df = pd.read_csv(io.StringIO(download_response.text))
                    return df
                elif data["url"].endswith(".json") or data.get("format") == "json":
                    import io
                    df = pd.read_json(io.StringIO(download_response.text))
                    return df
        
        return None
        
    except Exception as e:
        raise Exception(f"Error loading dataset: {str(e)}")
