"""
Dataset search and retrieval service
Integrates with Google AI API and Gemini for dataset search
"""
import os
import httpx
from typing import List, Dict, Any, Optional
import json
import pandas as pd
from app.core.config import settings
import google.genai as genai
from google.genai import types


async def _dataset_server_first_available_split(hf_id: str) -> Optional[Dict[str, str]]:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://datasets-server.huggingface.co/splits",
                params={"dataset": hf_id},
            )
            resp.raise_for_status()
            payload = resp.json()
            splits = payload.get("splits") or []
            if not splits:
                return None
            first = splits[0]
            config = first.get("config")
            split = first.get("split")
            if not config or not split:
                return None
            return {"config": config, "split": split}
    except Exception:
        return None

def _get_client() -> Optional[genai.Client]:
    api_key = (
        settings.ML_GOOGLE_API_KEY
        or settings.ML_GEMINI_API_KEY
        or settings.GOOGLE_API_KEY
        or settings.GEMINI_API_KEY
    )
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def _normalize_model_name(name: str) -> str:
    n = (name or "").strip()
    if not n:
        return ""
    if "/" in n:
        n = n.split("/")[-1].strip()
    return n


def _expand_model_variants(name: str) -> List[str]:
    base = _normalize_model_name(name)
    if not base:
        return []
    return [base, f"models/{base}"]


def _model_candidates() -> List[str]:
    candidates: List[str] = []
    if getattr(settings, "ML_GEMINI_MODEL", ""):
        candidates.extend(_expand_model_variants(settings.ML_GEMINI_MODEL))
    for m in [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
    ]:
        candidates.extend(_expand_model_variants(m))
    deduped: List[str] = []
    seen = set()
    for m in candidates:
        if m in seen:
            continue
        seen.add(m)
        deduped.append(m)
    return deduped


async def _generate_content_with_fallback(client: genai.Client, prompt: str, want_json: bool) -> str:
    last_err: Exception | None = None
    for model_name in _model_candidates():
        try:
            cfg = types.GenerateContentConfig(temperature=0.2)
            if want_json:
                cfg = types.GenerateContentConfig(temperature=0.2, response_mime_type="application/json")
            resp = client.models.generate_content(model=model_name, contents=prompt, config=cfg)
            return resp.text
        except Exception as e:
            last_err = e
            msg = str(e)
            if any(k in msg for k in ["NOT_FOUND", "not found", "404"]):
                continue
            if any(k in msg for k in ["INVALID_ARGUMENT", "unexpected model name format"]):
                continue
            raise
    raise Exception(f"No supported Gemini model found for this API key. Last error: {last_err}")


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
        # Validate against datasets-server so processing doesn't fail later with 404
        for it in items:
            if len(results) >= limit:
                break
            ds_id = it.get("id")
            if not ds_id:
                continue
            server_split = await _dataset_server_first_available_split(ds_id)
            if server_split is None:
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

    # For broad/generic queries, don't return empty list; provide curated defaults.
    if not unique:
        unique = curated[:]

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
        
        response_text = await _generate_content_with_fallback(client, prompt, want_json=True)

        response_text = response_text.strip()
        
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
        
    except json.JSONDecodeError:
        return await _search_public_sources(query, limit)
    except ValueError:
        return await _search_public_sources(query, limit)
    except Exception:
        return await _search_public_sources(query, limit)

async def load_dataset_by_id(dataset_id: str) -> Optional[pd.DataFrame]:
    """Load a dataset by ID - uses HuggingFace or direct URL"""
    try:
        # HuggingFace dataset ID format: hf:<repo_id>
        if dataset_id.startswith("hf:"):
            hf_id = dataset_id.replace("hf:", "", 1)
            async with httpx.AsyncClient(timeout=30.0) as client:
                splits: List[Dict[str, Any]] = []
                try:
                    splits_resp = await client.get(
                        "https://datasets-server.huggingface.co/splits",
                        params={"dataset": hf_id},
                    )
                    splits_resp.raise_for_status()
                    splits_payload = splits_resp.json()
                    splits = splits_payload.get("splits") or []
                except Exception:
                    splits = []

                # Try first available split+config; retry if datasets-server returns 404
                tried: List[Dict[str, str]] = []
                candidates: List[Dict[str, str]] = []
                for s in splits[:10]:
                    cfg = s.get("config")
                    spl = s.get("split")
                    if cfg and spl:
                        candidates.append({"config": cfg, "split": spl})
                if not candidates:
                    candidates = [{"config": "default", "split": "train"}]

                payload = None
                last_exc: Optional[Exception] = None
                for cand in candidates:
                    if cand in tried:
                        continue
                    tried.append(cand)
                    try:
                        resp = await client.get(
                            "https://datasets-server.huggingface.co/first-rows",
                            params={
                                "dataset": hf_id,
                                "split": cand["split"],
                                "config": cand["config"],
                            },
                        )
                        resp.raise_for_status()
                        payload = resp.json()
                        break
                    except Exception as e:
                        last_exc = e
                        payload = None

                if payload is None:
                    raise Exception(f"datasets-server failed for {hf_id}: {last_exc}")

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
        
        response_text = await _generate_content_with_fallback(client, prompt, want_json=True)

        data = json.loads(response_text)
        
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
