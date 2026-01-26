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
from google.genai import types

def _get_client() -> Optional[genai.Client]:
    api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def _curated_public_catalog() -> List[Dict[str, Any]]:
    return [
        {
            "id": "hf:imdb",
            "name": "IMDB Movie Reviews",
            "source": "huggingface",
            "description": "Large Movie Review Dataset for binary sentiment classification.",
            "sample_count": 50000,
            "quality_score": 90,
            "license": "Unknown",
            "tags": ["nlp", "sentiment", "classification"],
            "features": ["text", "label"],
            "url": "https://huggingface.co/datasets/imdb",
            "match_score": 85,
            "match_reasons": ["Popular public dataset"],
            "concerns": [],
        },
        {
            "id": "hf:ag_news",
            "name": "AG News",
            "source": "huggingface",
            "description": "News topic classification dataset with 4 classes.",
            "sample_count": 120000,
            "quality_score": 88,
            "license": "Unknown",
            "tags": ["nlp", "classification"],
            "features": ["text", "label"],
            "url": "https://huggingface.co/datasets/ag_news",
            "match_score": 82,
            "match_reasons": ["Popular public dataset"],
            "concerns": [],
        },
        {
            "id": "hf:tweet_eval",
            "name": "TweetEval",
            "source": "huggingface",
            "description": "Tweet classification benchmark with multiple tasks.",
            "sample_count": 70000,
            "quality_score": 85,
            "license": "Unknown",
            "tags": ["nlp", "tweets", "classification"],
            "features": ["text", "label"],
            "url": "https://huggingface.co/datasets/tweet_eval",
            "match_score": 80,
            "match_reasons": ["Popular public dataset"],
            "concerns": [],
        },
    ]


async def _search_huggingface_api(query: str, limit: int) -> List[Dict[str, Any]]:
    """Search Hugging Face public dataset index (no API key required)."""
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(
                "https://huggingface.co/api/datasets",
                params={"search": query, "limit": max(1, min(limit, 50))},
            )
            resp.raise_for_status()

        items = resp.json()
        results: List[Dict[str, Any]] = []
        for it in items[:limit]:
            ds_id = it.get("id")
            if not ds_id:
                continue
            results.append(
                {
                    "id": f"hf:{ds_id}",
                    "name": ds_id,
                    "source": "huggingface",
                    "description": it.get("description") or "",
                    "sample_count": it.get("downloads") or 0,
                    "quality_score": 80,
                    "license": "Unknown",
                    "tags": it.get("tags") or [],
                    "features": [],
                    "url": f"https://huggingface.co/datasets/{ds_id}",
                    "match_score": 80,
                    "match_reasons": ["Matched via Hugging Face search"],
                    "concerns": [],
                }
            )

        return results
    except Exception:
        return []


async def _search_public_sources(query: str, limit: int) -> List[Dict[str, Any]]:
    """Real search without Gemini API key."""
    q = (query or "").lower().strip()

    curated = _curated_public_catalog()
    curated_scored = []
    for item in curated:
        hay = " ".join([item.get("name", ""), item.get("description", ""), " ".join(item.get("tags", []))]).lower()
        if q and q not in hay:
            continue
        curated_scored.append(item)

    hf = await _search_huggingface_api(query, limit=limit)
    combined = curated_scored + hf

    seen = set()
    unique = []
    for item in combined:
        if item.get("id") in seen:
            continue
        seen.add(item.get("id"))
        unique.append(item)

    return unique[:limit]

async def search_datasets(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Search for datasets using Gemini AI"""
    try:
        client = _get_client()
        if client is None:
            return await _search_public_sources(query, limit)
        
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
        
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
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
        return await _search_public_sources(query, limit)
    except Exception as e:
        import traceback
        print(f"Search error: {e}")
        print(traceback.format_exc())
        raise Exception(f"Error searching datasets with AI: {str(e)}")

async def load_dataset_by_id(dataset_id: str) -> Optional[pd.DataFrame]:
    """Load a dataset by ID - uses HuggingFace or direct URL"""
    try:
        # HuggingFace dataset ID format: hf:<repo_id>
        if dataset_id.startswith("hf:"):
            hf_id = dataset_id.replace("hf:", "", 1)
            split_name = "train"
            config_name = "default"

            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    splits_resp = await client.get(
                        "https://datasets-server.huggingface.co/splits",
                        params={"dataset": hf_id},
                    )
                    splits_resp.raise_for_status()
                    splits_payload = splits_resp.json()

                    splits = splits_payload.get("splits") or []
                    if splits:
                        config_name = splits[0].get("config") or config_name
                        split_name = splits[0].get("split") or split_name
                except Exception:
                    pass

                # datasets-server provides fast sample rows without installing datasets library
                resp = await client.get(
                    "https://datasets-server.huggingface.co/first-rows",
                    params={
                        "dataset": hf_id,
                        "split": split_name,
                        "config": config_name,
                    },
                )
                resp.raise_for_status()
                payload = resp.json()

            rows = payload.get("rows") or []
            # Each row has {"row": {...}}
            records = [r.get("row", {}) for r in rows if isinstance(r, dict)]
            df = pd.DataFrame.from_records(records)
            return df
        
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
        
        client = _get_client()
        if client is None:
            return None

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
        
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
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
