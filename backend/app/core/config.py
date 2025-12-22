# backend/app/core/config.py
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuración para Producción con Credenciales Reales.
    """

    # === APP INFO ===
    PROJECT_NAME: str = "Plataforma Educativa Multi-Agente"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"

    # === CORS (Permitir tu IP pública) ===
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://3.228.25.217",       # Tu IP pública
        "http://3.228.25.217:80",
        "http://localhost",          # Para pruebas internas del servidor
        "http://localhost:5173",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # === DATABASE (TUS CREDENCIALES) ===
    # Usuario: agentlab
    # Pass: agentlab123/  (La barra final se escribe como %2F)
    # Host: db            (Nombre del servicio en Docker)
    # Base: agentes_db
    DATABASE_URL: str = "postgresql://agentlab:agentlab123%2F@db:5432/agentes_db?client_encoding=utf8"

    # === REDIS ===
    REDIS_URL: str = "redis://redis:6379/0"

    # === JWT AUTHENTICATION ===
    SECRET_KEY: str = "tu-clave-secreta-super-segura-cambiar-en-produccion-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # === SANDBOX ===
    DOCKER_SANDBOX_IMAGE: str = "python:3.10-slim"
    CODE_EXECUTION_TIMEOUT: int = 10

    # === SIMULATION CONFIG ===
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
