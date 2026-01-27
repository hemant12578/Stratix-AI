import os

os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")

import google.genai as genai
from google.genai import types
import httpx
import json
from typing import Dict, Any, List
from app.core.config import settings
from app.core.prompts import (
    SYSTEM_PROMPT_ANALYZER,
    USER_PROMPT_ANALYZER,
    SYSTEM_PROMPT_MATCHER,
    USER_PROMPT_MATCHER,
    SYSTEM_PROMPT_CLEANER,
    USER_PROMPT_CLEANER,
    SYSTEM_PROMPT_METADATA,
    USER_PROMPT_METADATA,
    SYSTEM_PROMPT_CODE_GENERATOR,
    USER_PROMPT_CODE_GENERATOR,
    SYSTEM_PROMPT_MARKET_RESEARCH,
    USER_PROMPT_MARKET_RESEARCH,
)

def _get_client(purpose: str = "default") -> genai.Client:
    purpose_l = (purpose or "").lower()
    if purpose_l == "strategy":
        api_key = (
            settings.STRATEGY_GOOGLE_API_KEY
            or settings.STRATEGY_GEMINI_API_KEY
            or settings.GOOGLE_API_KEY
            or settings.GEMINI_API_KEY
        )
    elif purpose_l == "ml":
        api_key = (
            settings.ML_GOOGLE_API_KEY
            or settings.ML_GEMINI_API_KEY
            or settings.GOOGLE_API_KEY
            or settings.GEMINI_API_KEY
        )
    else:
        api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY

    if not api_key:
        raise ValueError("Google API key not configured. Please set GOOGLE_API_KEY (or STRATEGY_GOOGLE_API_KEY / ML_GOOGLE_API_KEY) environment variable.")
    return genai.Client(api_key=api_key)


def _get_openrouter_key(purpose: str) -> str:
    purpose_l = (purpose or "").lower()
    if purpose_l == "strategy":
        return settings.STRATEGY_OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY
    if purpose_l == "ml":
        return settings.ML_OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY
    return settings.OPENROUTER_API_KEY


def _get_openai_key(purpose: str) -> str:
    purpose_l = (purpose or "").lower()
    if purpose_l == "strategy":
        return settings.STRATEGY_OPENAI_API_KEY or settings.OPENAI_API_KEY
    if purpose_l == "ml":
        return settings.ML_OPENAI_API_KEY or settings.OPENAI_API_KEY
    return settings.OPENAI_API_KEY


def _openai_model_candidates(purpose: str) -> List[str]:
    purpose_l = (purpose or "").lower()
    configured = ""
    if purpose_l == "strategy":
        configured = settings.STRATEGY_OPENAI_MODEL
    elif purpose_l == "ml":
        configured = settings.ML_OPENAI_MODEL

    candidates: List[str] = []
    if configured:
        candidates.append(configured)
    candidates.extend([
        "gpt-4o-mini",
        "gpt-4.1-mini",
        "gpt-4o",
    ])

    deduped: List[str] = []
    seen = set()
    for m in candidates:
        if m in seen:
            continue
        seen.add(m)
        deduped.append(m)
    return deduped


def _openai_generate(prompt: str, temperature: float, model: str, want_json: bool, api_key: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }
    if want_json:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=60.0) as client:
        resp = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    choice = (data.get("choices") or [{}])[0]
    message = choice.get("message") or {}
    content = message.get("content")
    if isinstance(content, str):
        return content
    return json.dumps(content)


def _openrouter_model_candidates(purpose: str) -> List[str]:
    purpose_l = (purpose or "").lower()
    configured = ""
    if purpose_l == "strategy":
        configured = settings.STRATEGY_OPENROUTER_MODEL
    elif purpose_l == "ml":
        configured = settings.ML_OPENROUTER_MODEL

    candidates: List[str] = []
    if configured:
        candidates.append(configured)
    candidates.extend(
        [
            "openai/gpt-4o-mini",
            "openai/gpt-4.1-mini",
            "google/gemini-2.0-flash",
        ]
    )

    deduped: List[str] = []
    seen = set()
    for m in candidates:
        if m in seen:
            continue
        seen.add(m)
        deduped.append(m)
    return deduped


def _openrouter_generate(prompt: str, temperature: float, model: str, want_json: bool, api_key: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Stratix AI",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }
    if want_json:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=60.0) as client:
        resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    choice = (data.get("choices") or [{}])[0]
    message = choice.get("message") or {}
    content = message.get("content")
    if isinstance(content, str):
        return content
    return json.dumps(content)


def _normalize_model_name(name: str) -> str:
    n = (name or "").strip()
    if not n:
        return ""
    # Accept common fully-qualified forms but normalize to the simple form.
    # Examples:
    # - models/gemini-1.5-flash -> gemini-1.5-flash
    # - publishers/google/models/gemini-1.5-flash -> gemini-1.5-flash
    if "/" in n:
        n = n.split("/")[-1].strip()
    return n


def _expand_model_variants(name: str) -> List[str]:
    base = _normalize_model_name(name)
    if not base:
        return []
    # Some backends accept plain IDs, others accept `models/<id>`.
    return [base, f"models/{base}"]


def _model_candidates(purpose: str) -> List[str]:
    purpose_l = (purpose or "").lower()
    configured = ""
    if purpose_l == "strategy":
        configured = settings.STRATEGY_GEMINI_MODEL
    elif purpose_l == "ml":
        configured = settings.ML_GEMINI_MODEL

    candidates: List[str] = []
    if configured:
        candidates.extend(_expand_model_variants(configured))

    # Fallbacks across common naming; whichever exists for the account will be used.
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


def _generate_with_model_fallback(purpose: str, prompt: str, temperature: float, want_json: bool) -> str:
    openrouter_key = _get_openrouter_key(purpose)
    if openrouter_key:
        last_err: Exception | None = None
        for model_name in _openrouter_model_candidates(purpose):
            try:
                return _openrouter_generate(prompt, temperature=temperature, model=model_name, want_json=want_json, api_key=openrouter_key)
            except Exception as e:
                last_err = e
                continue
        raise Exception(f"No supported OpenRouter model found for this API key. Last error: {last_err}")

    openai_key = _get_openai_key(purpose)
    if openai_key:
        last_err: Exception | None = None
        for model_name in _openai_model_candidates(purpose):
            try:
                return _openai_generate(prompt, temperature=temperature, model=model_name, want_json=want_json, api_key=openai_key)
            except Exception as e:
                last_err = e
                continue
        raise Exception(f"No supported OpenAI model found for this API key. Last error: {last_err}")

    client = _get_client(purpose)
    last_err: Exception | None = None
    for model_name in _model_candidates(purpose):
        try:
            cfg = types.GenerateContentConfig(temperature=temperature)
            if want_json:
                cfg = types.GenerateContentConfig(temperature=temperature, response_mime_type="application/json")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=cfg,
            )
            return response.text
        except Exception as e:
            last_err = e
            msg = str(e)
            if any(k in msg for k in ["NOT_FOUND", "not found", "404"]):
                continue
            if any(k in msg for k in ["INVALID_ARGUMENT", "unexpected model name format"]):
                continue
            raise
    raise Exception(
        f"No supported Gemini model found for this API key. Last error: {last_err}. "
        f"If you want to use OpenRouter instead, set STRATEGY_OPENROUTER_API_KEY / ML_OPENROUTER_API_KEY in server/.env and restart the backend."
    )


def _generate_json(prompt: str, temperature: float, purpose: str = "ml") -> Dict[str, Any]:
    response_text = (_generate_with_model_fallback(purpose, prompt, temperature, want_json=True) or "").strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    response_text = response_text.strip()

    # Extract first JSON object/array if extra text is present
    json_candidate = response_text
    if response_text and ("{" in response_text or "[" in response_text):
        first_obj = response_text.find("{")
        first_arr = response_text.find("[")
        start = min([i for i in [first_obj, first_arr] if i != -1], default=-1)
        if start != -1:
            json_candidate = response_text[start:]
            # Trim trailing non-JSON by finding last closing brace/bracket
            last_obj = json_candidate.rfind("}")
            last_arr = json_candidate.rfind("]")
            end = max(last_obj, last_arr)
            if end != -1:
                json_candidate = json_candidate[:end + 1]
    try:
        return json.loads(json_candidate)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from Gemini: {e}. Response: {response_text[:200]}")


def _generate_text(prompt: str, temperature: float, purpose: str = "ml") -> str:
    return _generate_with_model_fallback(purpose, prompt, temperature, want_json=False)

def analyze_requirement(user_input: str) -> Dict[str, Any]:
    """Analyze user's natural language requirement and extract structured data"""
    try:
        prompt = SYSTEM_PROMPT_ANALYZER + "\n\n" + USER_PROMPT_ANALYZER.format(user_input=user_input)
        return _generate_json(prompt, temperature=0.3, purpose="ml")
    except Exception:
        text = (user_input or "").lower()
        domain = "general"
        if any(k in text for k in ["sentiment", "review", "tweet", "text", "nlp"]):
            domain = "nlp"
        elif any(k in text for k in ["image", "vision", "object detection", "segmentation"]):
            domain = "vision"
        elif any(k in text for k in ["finance", "stock", "trading", "credit"]):
            domain = "finance"
        elif any(k in text for k in ["medical", "health", "disease", "clinical"]):
            domain = "healthcare"

        task_type = "classification"
        if any(k in text for k in ["regression", "predict price", "forecast"]):
            task_type = "regression"
        elif any(k in text for k in ["clustering"]):
            task_type = "clustering"

        return {
            "domain": domain,
            "task_type": task_type,
            "ml_framework": "sklearn",
            "required_features": [],
            "target_variable": {"name": "label", "type": "unknown"},
            "sample_size": {"minimum": 1000, "preferred": 10000},
            "output_format": "csv",
            "data_split": {"train": 0.7, "test": 0.2, "validation": 0.1},
            "constraints": {"language": "english", "region": "global"},
            "suggested_sources": ["huggingface"],
            "quality_requirements": {"min_score": 70, "max_missing_percent": 10, "balance_classes": False}
        }

def match_datasets(requirements: Dict[str, Any], datasets_metadata: List[Dict]) -> Dict[str, Any]:
    """Match requirements to available datasets"""
    try:
        requirements_json = json.dumps(requirements, indent=2)
        datasets_json = json.dumps(datasets_metadata, indent=2)
        
        prompt = SYSTEM_PROMPT_MATCHER + "\n\n" + USER_PROMPT_MATCHER.format(
            requirements_json=requirements_json,
            datasets_metadata=datasets_json
        )
        
        return _generate_json(prompt, temperature=0.2, purpose="ml")
    except Exception as e:
        # Fallback: return datasets sorted by name
        return {
            "matches": sorted(datasets_metadata, key=lambda x: x.get("name", ""))[:10],
            "recommended_combinations": []
        }

def generate_cleaning_strategy(
    column_names: List[str],
    dtypes: Dict[str, str],
    missing_report: Dict[str, int],
    sample_data: List[Dict],
    describe_stats: Dict[str, Any],
    user_requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate data cleaning strategy"""
    try:
        prompt = SYSTEM_PROMPT_CLEANER + "\n\n" + USER_PROMPT_CLEANER.format(
            column_names=", ".join(column_names),
            dtypes=json.dumps(dtypes),
            missing_report=json.dumps(missing_report),
            sample_data=json.dumps(sample_data[:5]),
            describe_stats=json.dumps(describe_stats),
            user_requirements=json.dumps(user_requirements)
        )
        
        return _generate_json(prompt, temperature=0.3)
    except Exception as e:
        # Fallback: basic cleaning
        return {
            "columns_to_keep": column_names,
            "columns_to_drop": [],
            "column_rename": {},
            "missing_value_strategy": {col: "drop_rows" for col in column_names if missing_report.get(col, 0) > 0},
            "outlier_handling": {},
            "data_type_conversion": {},
            "text_preprocessing": {"columns": [], "steps": []},
            "encoding": {"categorical_cols": [], "method": "label_encode"},
            "feature_engineering": [],
            "normalization": {"columns": [], "method": "standard_scaler"}
        }

def generate_metadata(
    rows: int,
    cols: int,
    column_list: List[str],
    sample_rows: List[Dict],
    describe_output: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate comprehensive dataset metadata"""
    from datetime import datetime
    try:
        prompt = SYSTEM_PROMPT_METADATA + "\n\n" + USER_PROMPT_METADATA.format(
            rows=rows,
            cols=cols,
            column_list=", ".join(column_list),
            sample_rows=json.dumps(sample_rows[:5]),
            describe_output=json.dumps(describe_output),
            date=datetime.now().strftime("%Y-%m-%d")
        )
        return _generate_json(prompt, temperature=0.3)
    except Exception as e:
        # Fallback metadata
        return {
            "dataset_info": {
                "title": "ML Training Dataset",
                "description": "Processed dataset for machine learning",
                "domain": "general",
                "use_cases": ["classification"],
                "version": "1.0",
                "created_date": datetime.now().strftime("%Y-%m-%d")
            },
            "features": [],
            "target_variable": {"name": "label", "type": "categorical"},
            "data_quality": {"completeness_score": 90, "consistency_score": 85, "accuracy_score": 88, "overall_quality": 88},
            "splits": {"train": {"samples": int(rows * 0.7), "percentage": 70}},
            "sources": [],
            "preprocessing_applied": []
        }

def generate_training_code(
    metadata: Dict[str, Any],
    ml_framework: str,
    task_type: str
) -> str:
    """Generate Python training code"""
    try:
        prompt = SYSTEM_PROMPT_CODE_GENERATOR + "\n\n" + USER_PROMPT_CODE_GENERATOR.format(
            metadata=json.dumps(metadata, indent=2),
            ml_framework=ml_framework,
            task_type=task_type
        )
        return _generate_text(prompt, temperature=0.5, purpose="ml")
    except Exception as e:
        # Fallback code
        return f"""# Generated training code for {task_type} using {ml_framework}

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# Load data
df = pd.read_csv('train.csv')

# Preprocessing
X = df.drop(columns=['label'])
y = df['label']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train model (add your model here)
# model = YourModel()
# model.fit(X_train, y_train)

# Evaluate
# predictions = model.predict(X_test)
﻿# print(f"Accuracy: {{accuracy_score(y_test, predictions)}}")
"""


def analyze_market_strategy(user_input: str) -> Dict[str, Any]:
    """Analyze a business idea / market query for Strategy Hub."""
    try:
        prompt = SYSTEM_PROMPT_MARKET_RESEARCH + "\n\n" + USER_PROMPT_MARKET_RESEARCH.replace(
            "{user_input}", user_input
        )
        return _generate_json(prompt, temperature=0.4, purpose="strategy")
    except Exception as e:
        raise e
