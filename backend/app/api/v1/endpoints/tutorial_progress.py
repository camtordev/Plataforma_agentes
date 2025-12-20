from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.db.models.user import User
from app.db.models.tutorial import Tutorial, UserProgress

router = APIRouter(prefix="/tutorials", tags=["tutorial-progress"])


# ========================
# SCHEMAS
# ========================
class ProgressResponse(BaseModel):
    status: str  # 'not_started', 'in_progress', 'completed'
    current_code: Optional[str] = None
    time_spent_seconds: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class StartTutorialRequest(BaseModel):
    initial_code: Optional[str] = None


class AutosaveRequest(BaseModel):
    code: str
    time_spent_seconds: int  # Tiempo acumulado desde el frontend


class CompleteTutorialRequest(BaseModel):
    final_code: str
    time_spent_seconds: int


# ========================
# ENDPOINTS
# ========================

@router.get("/{level}/progress", response_model=ProgressResponse)
def get_tutorial_progress(
    level: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el progreso del usuario en un tutorial específico.
    Si no existe progreso, devuelve status='not_started'.
    """
    # Buscar tutorial por nivel
    tutorial = db.query(Tutorial).filter(Tutorial.level == level).first()
    if not tutorial:
        raise HTTPException(status_code=404, detail=f"Tutorial nivel {level} no encontrado")
    
    # Buscar progreso del usuario
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.tutorial_id == tutorial.id
    ).first()
    
    if not progress:
        return ProgressResponse(
            status="not_started",
            current_code=None,
            time_spent_seconds=0,
            started_at=None,
            completed_at=None
        )
    
    return ProgressResponse(
        status=progress.status,
        current_code=progress.current_code,
        time_spent_seconds=progress.time_spent_seconds,
        started_at=progress.started_at,
        completed_at=progress.completed_at
    )


@router.post("/{level}/start", response_model=ProgressResponse)
def start_tutorial(
    level: int,
    request: StartTutorialRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Inicia un tutorial, crea el registro de progreso con status='in_progress'.
    Si ya existe, solo actualiza a 'in_progress'.
    """
    tutorial = db.query(Tutorial).filter(Tutorial.level == level).first()
    if not tutorial:
        raise HTTPException(status_code=404, detail=f"Tutorial nivel {level} no encontrado")
    
    # Verificar si ya existe progreso
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.tutorial_id == tutorial.id
    ).first()
    
    if progress:
        # Ya existe, actualizar a 'in_progress' si no estaba
        if progress.status != "in_progress":
            progress.status = "in_progress"
            db.commit()
            db.refresh(progress)
    else:
        # Crear nuevo registro
        progress = UserProgress(
            user_id=current_user.id,
            tutorial_id=tutorial.id,
            status="in_progress",
            current_code=request.initial_code or tutorial.starter_code,
            time_spent_seconds=0,
            started_at=datetime.utcnow()
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return ProgressResponse(
        status=progress.status,
        current_code=progress.current_code,
        time_spent_seconds=progress.time_spent_seconds,
        started_at=progress.started_at,
        completed_at=progress.completed_at
    )


@router.put("/{level}/autosave", response_model=ProgressResponse)
def autosave_tutorial(
    level: int,
    request: AutosaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Guarda automáticamente el código y tiempo acumulado.
    El frontend envía el tiempo total cada vez.
    """
    tutorial = db.query(Tutorial).filter(Tutorial.level == level).first()
    if not tutorial:
        raise HTTPException(status_code=404, detail=f"Tutorial nivel {level} no encontrado")
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.tutorial_id == tutorial.id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=400, 
            detail="No existe progreso. Usa POST /start primero"
        )
    
    # Actualizar código y tiempo
    progress.current_code = request.code
    progress.time_spent_seconds = request.time_spent_seconds
    
    db.commit()
    db.refresh(progress)
    
    return ProgressResponse(
        status=progress.status,
        current_code=progress.current_code,
        time_spent_seconds=progress.time_spent_seconds,
        started_at=progress.started_at,
        completed_at=progress.completed_at
    )


@router.post("/{level}/complete", response_model=ProgressResponse)
def complete_tutorial(
    level: int,
    request: CompleteTutorialRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marca el tutorial como completado.
    Guarda el código final y el tiempo total empleado.
    """
    tutorial = db.query(Tutorial).filter(Tutorial.level == level).first()
    if not tutorial:
        raise HTTPException(status_code=404, detail=f"Tutorial nivel {level} no encontrado")
    
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.tutorial_id == tutorial.id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=400, 
            detail="No existe progreso. Usa POST /start primero"
        )
    
    # Marcar como completado
    progress.status = "completed"
    progress.current_code = request.final_code
    progress.time_spent_seconds = request.time_spent_seconds
    progress.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    
    return ProgressResponse(
        status=progress.status,
        current_code=progress.current_code,
        time_spent_seconds=progress.time_spent_seconds,
        started_at=progress.started_at,
        completed_at=progress.completed_at
    )
