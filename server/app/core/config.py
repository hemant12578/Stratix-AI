from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    _ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
    model_config = ConfigDict(extra='ignore', env_file=str(_ENV_PATH), env_file_encoding="utf-8")
    
    # Gemini API / Google AI API
    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    STRATEGY_GEMINI_API_KEY: str = ""
    STRATEGY_GOOGLE_API_KEY: str = ""
    STRATEGY_GEMINI_MODEL: str = ""

    ML_GEMINI_API_KEY: str = ""
    ML_GOOGLE_API_KEY: str = ""
    ML_GEMINI_MODEL: str = ""

    OPENROUTER_API_KEY: str = ""
    STRATEGY_OPENROUTER_API_KEY: str = ""
    ML_OPENROUTER_API_KEY: str = ""
    STRATEGY_OPENROUTER_MODEL: str = ""
    ML_OPENROUTER_MODEL: str = ""

    OPENAI_API_KEY: str = ""
    STRATEGY_OPENAI_API_KEY: str = ""
    ML_OPENAI_API_KEY: str = ""
    STRATEGY_OPENAI_MODEL: str = ""
    ML_OPENAI_MODEL: str = ""
    
    # Storage
    STORAGE_DIR: str = "./data/temp"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # AI API Configuration
    AI_API_BASE_URL: str = ""
    AI_API_KEY: str = ""
    
    # Data sources
    KAGGLE_USERNAME: Optional[str] = ""
    KAGGLE_KEY: Optional[str] = ""
    
    # Redis (optional for caching)
    REDIS_URL: Optional[str] = ""

settings = Settings()
