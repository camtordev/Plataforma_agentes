# backend/app/db/base.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Importamos todos los modelos aquí para que Alembic los detecte automáticamente
# Esto es importante para las migraciones

# Módulo 1: Autenticación
from app.db.models.user import User, Role, UserSession  # noqa

# Módulo 2: Proyectos
from app.db.models.project import (  # noqa
    Project,
    ProjectVersion,
    SharedProject,
    ProjectCollaborator
)

# Módulo 3: Tutoriales
from app.db.models.tutorial import (  # noqa
    Tutorial,
    UserProgress,
    Achievement,
    UserAchievement
)

# Módulo 4: Métricas
from app.db.models.metrics import (  # noqa
    SimulationMetrics,
    AgentMetrics,
    HeatmapData
)
