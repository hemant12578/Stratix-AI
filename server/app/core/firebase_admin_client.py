from pathlib import Path
import os

try:
    import firebase_admin
    from firebase_admin import credentials
except ImportError:
    firebase_admin = None
    credentials = None


def initialize_firebase_admin() -> bool:
    """Initialize Firebase Admin SDK once. Returns True if initialized."""
    if firebase_admin is None or credentials is None:
        return False

    if firebase_admin._apps:
        return True

    # Priority:
    # 1) explicit env path
    # 2) common filename in server root
    cred_path = os.getenv("FIREBASE_ADMIN_CREDENTIALS_PATH", "").strip()
    if not cred_path:
        default_path = Path(__file__).resolve().parents[2] / "stratix-ai-firebase-adminsdk-fbsvc-96a95a85fc.json"
        cred_path = str(default_path)

    path_obj = Path(cred_path)
    if not path_obj.exists():
        return False

    try:
        cred = credentials.Certificate(str(path_obj))
        firebase_admin.initialize_app(cred)
        return True
    except Exception:
        return False
