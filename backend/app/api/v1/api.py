from fastapi import APIRouter
from app.api.v1.endpoints import tutorials, projects, auth

api_router = APIRouter()

# Rutas de autenticación
api_router.include_router(
    auth.router, prefix="/auth", tags=["auth"])

# Rutas de tutoriales
api_router.include_router(
    tutorials.router, prefix="/tutorials", tags=["tutorials"])

# Rutas de proyectos (RF5)
api_router.include_router(
    projects.router, prefix="/projects", tags=["projects"])
