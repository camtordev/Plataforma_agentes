from fastapi import APIRouter
from app.api.v1.endpoints import tutorials, tutorial_progress

api_router = APIRouter()
api_router.include_router(tutorials.router)
api_router.include_router(tutorial_progress.router)
