import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(extra='ignore')
    
    # Gemini API / Google AI API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AIzaSyB_LX0uuilCy_J9scaHWMEYo_qWd-QeX08")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "AIzaSyB_LX0uuilCy_J9scaHWMEYo_qWd-QeX08")
    
    # Storage
    STORAGE_DIR: str = "./data/temp"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # AI API Configuration
    AI_API_BASE_URL: str = os.getenv("AI_API_BASE_URL", "")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "AIzaSyB_LX0uuilCy_J9scaHWMEYo_qWd-QeX08")
    
    # Data sources
    KAGGLE_USERNAME: Optional[str] = os.getenv("KAGGLE_USERNAME", "")
    KAGGLE_KEY: Optional[str] = os.getenv("KAGGLE_KEY", "")
    
    # Redis (optional for caching)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", "")

settings = Settings()
