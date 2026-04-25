from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pathlib import Path
import json
from datetime import datetime, timezone

from app.core.config import settings

router = APIRouter()


def _state_path() -> Path:
    base = Path(settings.STORAGE_DIR).resolve()
    base.mkdir(parents=True, exist_ok=True)
    return base / "admin_state.json"


def _load_state() -> Dict[str, Any]:
    path = _state_path()
    if not path.exists():
        return {"users": [], "employees": [], "admin_accounts": [], "features": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"users": [], "employees": [], "admin_accounts": [], "features": {}}


def _save_state(state: Dict[str, Any]) -> None:
    _state_path().write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

@router.get("/user/history")
async def get_user_history():
    """Get user's request history"""
    # TODO: Implement real user history from database
    return {
        "status": "success",
        "history": []
    }

@router.get("/user/profile")
async def get_user_profile():
    """Get user profile"""
    # TODO: Implement real user profile from database
    return {
        "status": "success",
        "profile": {}
    }


@router.post("/user/sync")
async def sync_user_profile(payload: Dict[str, Any]):
    """Upsert user info so admin dashboard can show real users."""
    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    state = _load_state()
    users = state.get("users", [])
    now_iso = datetime.now(timezone.utc).isoformat()
    idx = next((i for i, u in enumerate(users) if u.get("email", "").lower() == email), -1)

    user_data = {
        "id": payload.get("uid") or payload.get("id") or email.replace("@", "_").replace(".", "_"),
        "name": payload.get("name") or email.split("@")[0],
        "email": email,
        "subscriptionTier": payload.get("subscriptionTier") or "free",
        "requestsUsed": int(payload.get("requestsUsed") or 0),
        "active": bool(payload.get("active", True)),
    }

    if idx >= 0:
        users[idx] = {**users[idx], **user_data, "updatedAt": now_iso}
    else:
        users.insert(0, {**user_data, "createdAt": now_iso, "updatedAt": now_iso})

    state["users"] = users
    _save_state(state)
    return {"status": "success", "user": user_data}
