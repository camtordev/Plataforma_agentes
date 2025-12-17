from fastapi import APIRouter
from app.api.v1.endpoints import tutoriales  # <-- ajusta el import a tu estructura

api_router = APIRouter()
api_router.include_router(tutoriales.router)
