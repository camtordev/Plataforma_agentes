from fastapi import APIRouter
from app.api.v1.endpoints import tutorials, projects, auth, tutorial_progress

api_router = APIRouter()

# Rutas de autenticación
api_router.include_router(
    auth.router, prefix="/auth", tags=["auth"])

# Rutas de tutoriales (contenido)
api_router.include_router(
    tutorials.router, prefix="/tutorials", tags=["tutorials"])

# Rutas de progreso de tutoriales (con autenticación)
api_router.include_router(
    tutorial_progress.router, tags=["tutorial-progress"])

# Rutas de proyectos (RF5)
api_router.include_router(
    projects.router, prefix="/projects", tags=["projects"])
