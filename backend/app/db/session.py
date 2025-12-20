# backend/app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Importar todos los modelos para que SQLAlchemy pueda resolver las relaciones
from app.db.models.user import User, Role, UserSession  # noqa: F401
from app.db.models.project import Project, SharedProject, ProjectCollaborator  # noqa: F401
from app.db.models.tutorial import Tutorial, UserProgress, Achievement, UserAchievement  # noqa: F401
from app.db.models.metrics import SimulationMetrics, AgentMetrics, HeatmapData  # noqa: F401

# Crear engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=False  # Cambiar a True para debug SQL
)

# SessionLocal para crear sesiones de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency para FastAPI


def get_db():
    """
    Dependency que provee una sesión de base de datos.
    Se cierra automáticamente después de cada request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
