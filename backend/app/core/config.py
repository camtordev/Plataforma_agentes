# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # === DATABASE ===
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/agentes_db"

    # === JWT AUTHENTICATION ===
    SECRET_KEY: str = "tu-clave-secreta-super-segura-cambiar-en-produccion-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    # === REDIS ===
    REDIS_URL: str = "redis://localhost:6379/0"

    # === CORS ===
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", "http://localhost:3000"]

    # === APP ===
    PROJECT_NAME: str = "Plataforma Educativa Multi-Agente"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"

    # === SANDBOX ===
    DOCKER_SANDBOX_IMAGE: str = "python:3.10-slim"
    CODE_EXECUTION_TIMEOUT: int = 10  # segundos

    # === SIMULATION ===
    MAX_AGENTS_PER_SIMULATION: int = 100
    DEFAULT_GRID_SIZE: int = 25
    MIN_GRID_SIZE: int = 5
    MAX_GRID_SIZE: int = 50

    # === FILE UPLOADS ===
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".json", ".py"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
