from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict, Any, List
from pathlib import Path
import json
from datetime import datetime, timezone
import hashlib
import secrets
import os

from app.core.config import settings
from app.api.process import job_status
from app.core.firebase_admin_client import initialize_firebase_admin

router = APIRouter()
admin_sessions: Dict[str, Dict[str, Any]] = {}


def _is_admin(email: str) -> bool:
    normalized = (email or "").strip().lower()
    if not normalized:
        return False

    env_allow = os.getenv("ADMIN_EMAILS", "")
    parsed = [item.strip().lower() for item in env_allow.split(",") if item.strip()]
    if parsed:
        if normalized in parsed:
            return True

    # Persisted admin accounts should remain valid across restarts.
    state = _load_state()
    if any(
        acc.get("role") == "admin" and acc.get("email", "").strip().lower() == normalized
        for acc in state.get("admin_accounts", [])
    ):
        return True

    return "admin" in normalized


def _require_admin(x_admin_email: Optional[str], x_admin_token: Optional[str]) -> str:
    if x_admin_token:
        session = admin_sessions.get(x_admin_token)
        if session and session.get("role") == "admin":
            return session.get("email", "")
    if not x_admin_email:
        raise HTTPException(status_code=401, detail="Missing admin identity")
    if not _is_admin(x_admin_email):
        raise HTTPException(status_code=403, detail="Admin access denied")
    return x_admin_email


def _state_path() -> Path:
    base = Path(settings.STORAGE_DIR).resolve()
    base.mkdir(parents=True, exist_ok=True)
    return base / "admin_state.json"


def _default_state() -> Dict[str, Any]:
    return {
        "users": [],
        "employees": [],
        "admin_accounts": [],
        "features": {
            "datasetSearch": True,
            "processing": True,
            "downloads": True,
            "strategyHub": True,
        },
    }


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def _sanitize_account(account: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": account.get("id"),
        "name": account.get("name"),
        "email": account.get("email"),
        "role": account.get("role"),
        "createdAt": account.get("createdAt"),
    }


def _load_state() -> Dict[str, Any]:
    path = _state_path()
    if not path.exists():
        return _default_state()
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
        if "admin_accounts" not in state:
            state["admin_accounts"] = []
        return state
    except Exception:
        return _default_state()


def _save_state(state: Dict[str, Any]) -> None:
    _state_path().write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def _scan_requests() -> List[Dict[str, Any]]:
    requests: List[Dict[str, Any]] = []
    base = Path(settings.STORAGE_DIR).resolve()
    for file in base.glob("*_metadata.json"):
        job_id = file.name.replace("_metadata.json", "")
        status = job_status.get(job_id, {})
        requests.append(
            {
                "jobId": job_id,
                "status": status.get("status", "completed"),
                "progress": status.get("progress", 100),
                "message": status.get("message", "Done"),
                "updatedAt": datetime.fromtimestamp(file.stat().st_mtime, tz=timezone.utc).isoformat(),
            }
        )
    requests.sort(key=lambda x: x["updatedAt"], reverse=True)
    return requests


def _daily_buckets(items: List[Dict[str, Any]], field: str) -> List[Dict[str, Any]]:
    buckets: Dict[str, int] = {}
    for item in items:
        raw = item.get(field)
        if not raw:
            continue
        try:
            day = datetime.fromisoformat(raw.replace("Z", "+00:00")).strftime("%Y-%m-%d")
            buckets[day] = buckets.get(day, 0) + 1
        except Exception:
            continue
    return [{"date": k, "count": buckets[k]} for k in sorted(buckets.keys())]


def _firebase_users() -> List[Dict[str, Any]]:
    try:
        import firebase_admin
        from firebase_admin import auth as fb_auth

        initialize_firebase_admin()
        if not firebase_admin._apps:
            return []

        users: List[Dict[str, Any]] = []
        page = fb_auth.list_users()
        for user in page.users:
            users.append(
                {
                    "id": f"firebase_{user.uid}",
                    "name": user.display_name or (user.email.split("@")[0] if user.email else "user"),
                    "email": (user.email or "").lower(),
                    "subscriptionTier": "free",
                    "requestsUsed": 0,
                    "active": not user.disabled,
                    "createdAt": user.user_metadata.creation_timestamp
                    and datetime.fromtimestamp(user.user_metadata.creation_timestamp / 1000, tz=timezone.utc).isoformat()
                    or datetime.now(timezone.utc).isoformat(),
                }
            )
        return [u for u in users if u.get("email")]
    except Exception:
        return []


def _merge_users(state_users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    by_email: Dict[str, Dict[str, Any]] = {}

    for user in _firebase_users():
        email = (user.get("email") or "").lower()
        if email:
            by_email[email] = user

    for user in state_users:
        email = (user.get("email") or "").lower()
        if not email:
            continue
        base = by_email.get(email, {})
        by_email[email] = {**base, **user}

    merged = list(by_email.values())
    merged.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return merged


@router.post("/admin/auth/login")
async def admin_login(payload: Dict[str, Any]):
    state = _load_state()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    account = next(
        (a for a in state.get("admin_accounts", []) if a.get("email", "").lower() == email and a.get("role") == "admin"),
        None,
    )
    if account:
        salt = account.get("salt", "")
        if _hash_password(password, salt) != account.get("password_hash"):
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
    else:
        if not _is_admin(email):
            raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = secrets.token_urlsafe(32)
    admin_sessions[token] = {"email": email, "role": "admin", "createdAt": datetime.now(timezone.utc).isoformat()}
    return {"status": "success", "token": token, "admin": {"email": email, "role": "admin"}}


@router.get("/admin/accounts")
async def get_admin_accounts(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    accounts = _load_state().get("admin_accounts", [])
    return {"status": "success", "accounts": [_sanitize_account(a) for a in accounts]}


@router.post("/admin/accounts")
async def add_admin_account(
    payload: Dict[str, Any],
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    role = (payload.get("role") or "employee").strip().lower()
    password = payload.get("password") or ""
    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")
    if role not in {"admin", "employee"}:
        raise HTTPException(status_code=400, detail="Role must be admin or employee")
    if any(a.get("email", "").lower() == email for a in state.get("admin_accounts", [])):
        raise HTTPException(status_code=409, detail="Account already exists")

    salt = secrets.token_hex(16)
    account = {
        "id": payload.get("id") or email.replace("@", "_").replace(".", "_"),
        "name": name,
        "email": email,
        "role": role,
        "salt": salt,
        "password_hash": _hash_password(password, salt),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    state["admin_accounts"] = [account, *state.get("admin_accounts", [])]
    _save_state(state)
    return {"status": "success", "account": _sanitize_account(account)}


@router.get("/admin/overview")
async def get_admin_overview(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    requests = _scan_requests()
    users = _merge_users(state.get("users", []))
    total_users = len(users)
    active_users = sum(1 for u in users if u.get("active", True))
    completed = sum(1 for r in requests if r.get("status") == "completed")

    return {
        "status": "success",
        "stats": {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalRequests": len(requests),
            "processingJobs": sum(1 for r in requests if r.get("status") in {"queued", "processing"}),
            "totalDatasets": completed,
            "revenue": total_users * 199,
        },
        "recentRequests": requests[:20],
        "recentUsers": users[:20],
        "features": state.get("features", {}),
        "employees": state.get("employees", []),
        "accounts": [_sanitize_account(a) for a in state.get("admin_accounts", [])[:20]],
    }


@router.get("/admin/requests")
async def get_admin_requests(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    requests = _scan_requests()
    return {"status": "success", "requests": requests}


@router.get("/admin/analytics")
async def get_admin_analytics(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    requests = _scan_requests()
    users = _merge_users(state.get("users", []))
    accounts = state.get("admin_accounts", [])

    return {
        "status": "success",
        "dailyNewUsers": _daily_buckets(users, "createdAt"),
        "dailyRequests": _daily_buckets(requests, "updatedAt"),
        "planDistribution": [
            {"name": "free", "value": sum(1 for u in users if (u.get("subscriptionTier") or "free") == "free")},
            {"name": "pro", "value": sum(1 for u in users if u.get("subscriptionTier") == "pro")},
            {"name": "enterprise", "value": sum(1 for u in users if u.get("subscriptionTier") == "enterprise")},
        ],
        "roles": [
            {"name": "admin", "value": sum(1 for a in accounts if a.get("role") == "admin")},
            {"name": "employee", "value": sum(1 for a in accounts if a.get("role") == "employee")},
        ],
    }


@router.get("/admin/users")
async def get_admin_users(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    return {"status": "success", "users": _merge_users(state.get("users", []))}


@router.post("/admin/users")
async def add_admin_user(
    payload: Dict[str, Any],
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if any(u.get("email", "").lower() == email for u in state.get("users", [])):
        raise HTTPException(status_code=409, detail="User already exists")
    user = {
        "id": payload.get("id") or email.replace("@", "_").replace(".", "_"),
        "name": payload.get("name") or email.split("@")[0],
        "email": email,
        "subscriptionTier": payload.get("subscriptionTier") or "free",
        "requestsUsed": int(payload.get("requestsUsed") or 0),
        "active": bool(payload.get("active", True)),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    state["users"] = [user, *state.get("users", [])]
    _save_state(state)
    return {"status": "success", "user": user}


@router.put("/admin/users/{user_id}")
async def update_admin_user(
    user_id: str,
    payload: Dict[str, Any],
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    users = state.get("users", [])
    idx = next((i for i, u in enumerate(users) if u.get("id") == user_id), -1)
    incoming_email = (payload.get("email") or "").strip().lower()
    if incoming_email and any(u.get("id") != user_id and u.get("email", "").lower() == incoming_email for u in users):
        raise HTTPException(status_code=409, detail="Email already used by another user")
    normalized_payload = {**payload}
    if incoming_email:
        normalized_payload["email"] = incoming_email
    if idx < 0:
        # Allow editing/saving users discovered from Firebase but not yet in local state.
        seed_email = incoming_email or (payload.get("email") or "").strip().lower()
        if not seed_email:
            raise HTTPException(status_code=404, detail="User not found")
        users.insert(
            0,
            {
                "id": user_id,
                "name": payload.get("name") or seed_email.split("@")[0],
                "email": seed_email,
                "subscriptionTier": payload.get("subscriptionTier") or "free",
                "requestsUsed": int(payload.get("requestsUsed") or 0),
                "active": bool(payload.get("active", True)),
                "createdAt": datetime.now(timezone.utc).isoformat(),
            },
        )
        idx = 0
    else:
        users[idx] = {**users[idx], **normalized_payload}
    state["users"] = users
    _save_state(state)
    return {"status": "success", "user": users[idx]}


@router.delete("/admin/users/{user_id}")
async def delete_admin_user(
    user_id: str,
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    users = state.get("users", [])
    new_users = [u for u in users if u.get("id") != user_id]
    if len(new_users) == len(users):
        raise HTTPException(status_code=404, detail="User not found")
    state["users"] = new_users
    _save_state(state)
    return {"status": "success"}


@router.get("/admin/features")
async def get_admin_features(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    return {"status": "success", "features": _load_state().get("features", {})}


@router.put("/admin/features")
async def update_admin_features(
    payload: Dict[str, Any],
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    incoming = payload.get("features", {})
    state["features"] = {**state.get("features", {}), **incoming}
    _save_state(state)
    return {"status": "success", "features": state["features"]}


@router.get("/admin/employees")
async def get_admin_employees(
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    return {"status": "success", "employees": _load_state().get("employees", [])}


@router.post("/admin/employees")
async def add_admin_employee(
    payload: Dict[str, Any],
    x_admin_email: Optional[str] = Header(default=None),
    x_admin_token: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email, x_admin_token)
    state = _load_state()
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    role = (payload.get("role") or "analyst").strip().lower()
    if not name or not email:
        raise HTTPException(status_code=400, detail="Name and email are required")
    employee = {
        "id": payload.get("id") or f"emp_{int(datetime.now().timestamp())}",
        "name": name,
        "email": email,
        "role": role,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    state["employees"] = [employee, *state.get("employees", [])]
    _save_state(state)
    return {"status": "success", "employee": employee}

