"""
Endpoints para gestión de proyectos (RF5)
Incluye CRUD, versionado, exportar/importar, compartir y galería pública
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from uuid import UUID
import secrets
from datetime import datetime, timedelta, timezone
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_active_user
from app.db.models.user import User
from app.db.models.project import Project, SharedProject
from app.services.game_instance import get_engine, get_any_engine_for_project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    SharedProjectCreate,
    SharedProjectResponse,
    ProjectExport,
    ProjectImport,
    ProjectFilters,
)

router = APIRouter()


# ============================================================================
# RF5.1 - CRUD DE PROYECTOS
# ============================================================================

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crea un nuevo proyecto para el usuario autenticado.

    **RF5.1 - Guardado de Proyectos**
    """
    project = Project(
        user_id=current_user.id,
        **project_data.model_dump()
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    # Agregar contadores
    project.likes_count = 0
    project.forks_count = 0

    return project


@router.get("/", response_model=List[ProjectListResponse])
async def get_my_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtiene todos los proyectos del usuario autenticado.

    **RF5.1 - Guardado de Proyectos**
    """
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(desc(Project.updated_at)).offset(skip).limit(limit).all()

    # Agregar contadores a cada proyecto
    for project in projects:
        project.likes_count = 0  # TODO: implementar sistema de likes
        project.forks_count = db.query(func.count(Project.id)).filter(
            Project.fork_from_id == project.id
        ).scalar() or 0

    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtiene un proyecto específico por ID.
    Solo el dueño puede acceder a proyectos privados.

    **RF5.1 - Guardado de Proyectos**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id and not project.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este proyecto"
        )

    # Actualizar last_opened_at
    if project.user_id == current_user.id:
        project.last_opened_at = datetime.utcnow()
        db.commit()

    # Agregar contadores
    project.likes_count = 0
    project.forks_count = db.query(func.count(Project.id)).filter(
        Project.fork_from_id == project.id
    ).scalar() or 0

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Actualiza un proyecto existente.
    Solo el dueño puede actualizar.

    **RF5.1 - Guardado de Proyectos**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar este proyecto"
        )

    # Actualizar campos
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    # Sincronizar config de simulación si se envía en el payload
    if project_data.simulation_config is not None:
        project.simulation_config = project_data.simulation_config

    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)

    # Agregar contadores
    project.likes_count = 0
    project.forks_count = db.query(func.count(Project.id)).filter(
        Project.fork_from_id == project.id
    ).scalar() or 0

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Elimina un proyecto.
    Solo el dueño puede eliminar.

    **RF5.1 - Guardado de Proyectos**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar este proyecto"
        )

    db.delete(project)
    db.commit()

    return None


# ============================================================================
# RF5.1 - EXPORTAR / IMPORTAR
# ============================================================================

@router.get("/{project_id}/export", response_model=ProjectExport)
async def export_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Exporta un proyecto completo en formato JSON.

    **RF5.1 - Exportar proyectos**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id and not project.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para exportar este proyecto"
        )

    # Tomar snapshot del estado actual del motor (agentes, comida, obstáculos)
    try:
        engine = get_any_engine_for_project(project_id) or get_engine(project_id)
        state = engine.get_state().get("data", {}) if engine else {}
    except Exception:
        state = {}

    # Si el estado vivo tiene datos, usarlo; si está vacío, conservar lo persistido
    if state and (state.get("agents") or state.get("food") or state.get("obstacles") or state.get("config")):
        project.world_state = state
        project.grid_width = state.get("width", project.grid_width)
        project.grid_height = state.get("height", project.grid_height)
        if "config" in state:
            project.simulation_config = state.get("config")

    # Serializar con pydantic tomando atributos del modelo sin mutar la BD al exportar
    export_data = ProjectExport.model_validate(project, from_attributes=True)

    return export_data


@router.post("/import", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def import_project(
    project_data: ProjectImport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Importa un proyecto desde JSON exportado.

    **RF5.1 - Importar proyectos**
    """
    # Crear nuevo proyecto (sin copiar ID)
    project = Project(
        user_id=current_user.id,
        **project_data.model_dump()
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.post("/{project_id}/fork", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def fork_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crea una copia (fork) de un proyecto.

    **RF5.1 - Sistema de versionado (fork)**
    """
    original_project = db.query(Project).filter(
        Project.id == project_id).first()

    if not original_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar si es público o del usuario
    if not original_project.is_public and original_project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para hacer fork de este proyecto"
        )

    # Capturar estado vivo del motor antes de copiar (solo si hay datos)
    try:
        engine = get_any_engine_for_project(project_id) or get_engine(project_id)
        state = engine.get_state().get("data", {}) if engine else {}
    except Exception:
        state = {}

    if not state:
        state = original_project.world_state or {}

    if state.get("agents") or state.get("food") or state.get("obstacles"):

        original_project.world_state = state
        original_project.grid_width = state.get(
            "width", original_project.grid_width)
        original_project.grid_height = state.get(
            "height", original_project.grid_height)
        if "config" in state:
            original_project.simulation_config = state.get("config")

    # Crear fork
    forked_project = Project(
        user_id=current_user.id,
        fork_from_id=original_project.id,
        title=f"{original_project.title} (Fork)",
        description=original_project.description,
        thumbnail_url=original_project.thumbnail_url,
        is_public=False,  # Los forks son privados por defecto
        is_template=False,
        grid_width=original_project.grid_width,
        grid_height=original_project.grid_height,
        cell_size=original_project.cell_size,
        user_code=original_project.user_code,
        code_language=original_project.code_language,
        world_state=original_project.world_state,
        simulation_config=original_project.simulation_config,
        agent_type=original_project.agent_type,
        difficulty_level=original_project.difficulty_level
    )

    db.add(forked_project)
    db.commit()
    db.refresh(forked_project)

    # Agregar contadores
    forked_project.likes_count = 0
    forked_project.forks_count = 0

    return forked_project


# ============================================================================
# RF5.2 - COMPARTIR PROYECTOS
# ============================================================================

@router.post("/{project_id}/share", response_model=SharedProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_share_link(
    project_id: UUID,
    share_data: SharedProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Genera un enlace único para compartir proyecto.

    **RF5.2 - Compartición Social**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para compartir este proyecto"
        )

    # Verificar si ya existe un enlace activo
    existing_share = db.query(SharedProject).filter(
        SharedProject.project_id == project_id,
        SharedProject.is_active == True
    ).first()

    if existing_share:
        fork_count = db.query(func.count(Project.id)).filter(
            Project.fork_from_id == project_id
        ).scalar() or 0
        response = {
            'id': existing_share.id,
            'project_id': existing_share.project_id,
            'share_token': existing_share.share_token,
            'view_count': existing_share.current_views,
            'fork_count': fork_count,
            'allow_fork': existing_share.allow_fork,
            'allow_download': existing_share.allow_download,
            'expires_at': existing_share.expires_at,
            'is_active': existing_share.is_active,
            'created_at': existing_share.created_at,
        }
        return response

    # Generar token único
    share_token = secrets.token_urlsafe(16)

    # Calcular expiración
    expires_at = None
    if share_data.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=share_data.expires_in_days)

    # Crear enlace compartido
    shared_project = SharedProject(
        project_id=project_id,
        share_token=share_token,
        share_type=share_data.share_type or "view",
        expires_at=expires_at,
        allow_fork=share_data.allow_fork,
        allow_download=share_data.allow_download
    )

    db.add(shared_project)
    db.commit()
    db.refresh(shared_project)

    # Construir respuesta con los campos requeridos por el schema
    fork_count = db.query(func.count(Project.id)).filter(
        Project.fork_from_id == project_id
    ).scalar() or 0
    response = {
        'id': shared_project.id,
        'project_id': shared_project.project_id,
        'share_token': shared_project.share_token,
        'view_count': shared_project.current_views,
        'fork_count': fork_count,
        'allow_fork': shared_project.allow_fork,
        'allow_download': shared_project.allow_download,
        'expires_at': shared_project.expires_at,
        'is_active': shared_project.is_active,
        'created_at': shared_project.created_at,
    }
    return response


@router.get("/shared/{share_token}", response_model=ProjectResponse)
async def get_shared_project(
    share_token: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene un proyecto compartido mediante token.
    Acceso público sin autenticación.

    **RF5.2 - Compartición Social (vista previa)**
    """
    shared = db.query(SharedProject).filter(
        SharedProject.share_token == share_token,
        SharedProject.is_active == True
    ).first()

    if not shared:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enlace compartido no encontrado o expirado"
        )

    # Verificar expiración
    if shared.expires_at:
        expires_at = shared.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        now_utc = datetime.now(timezone.utc)
        if expires_at < now_utc:
            shared.is_active = False
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="El enlace ha expirado"
            )

    # Incrementar contador de vistas
    shared.current_views += 1
    db.commit()

    # Obtener proyecto
    project = db.query(Project).filter(Project.id == shared.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Agregar contadores
    project.likes_count = 0
    project.forks_count = db.query(func.count(Project.id)).filter(
        Project.fork_from_id == project.id
    ).scalar() or 0

    return project


@router.delete("/{project_id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share_link(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Revoca el enlace compartido de un proyecto.

    **RF5.2 - Compartición Social**
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    # Verificar permisos
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para revocar este enlace"
        )

    # Desactivar enlace
    shared = db.query(SharedProject).filter(
        SharedProject.project_id == project_id,
        SharedProject.is_active == True
    ).first()

    if shared:
        shared.is_active = False
        db.commit()

    return None


# ============================================================================
# RF5.3 - GALERÍA COMUNITARIA
# ============================================================================

@router.get("/public/gallery", response_model=List[ProjectListResponse])
async def get_public_projects(
    agent_type: Optional[str] = Query(
        None, description="Filtrar por tipo de agente"),
    difficulty_level: Optional[int] = Query(
        None, ge=1, le=5, description="Filtrar por dificultad"),
    sort_by: str = Query("recent", description="recent, popular, liked"),
    search: Optional[str] = Query(None, description="Buscar por título o autor"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Obtiene proyectos públicos con filtros.
    Acceso público sin autenticación.

    **RF5.3 - Galería Comunitaria**
    """
    query = db.query(Project).join(User, Project.user_id == User.id).filter(Project.is_public == True)

    # Aplicar filtros
    if agent_type:
        query = query.filter(Project.agent_type == agent_type)

    if difficulty_level:
        query = query.filter(Project.difficulty_level == difficulty_level)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Project.title.ilike(like),
                User.username.ilike(like),
                User.full_name.ilike(like)
            )
        )

    # Aplicar ordenamiento
    if sort_by == "recent":
        query = query.order_by(desc(Project.created_at))
    elif sort_by == "popular":
        query = query.order_by(desc(Project.execution_count))
    elif sort_by == "liked":
        # TODO: Implementar sistema de likes
        query = query.order_by(desc(Project.created_at))

    projects = query.offset(skip).limit(limit).all()

    # Agregar contadores
    for project in projects:
        project.likes_count = 0
        project.forks_count = db.query(func.count(Project.id)).filter(
            Project.fork_from_id == project.id
        ).scalar() or 0
        project.owner_name = project.owner.username if project.owner else None

    return projects


@router.get("/public/{project_id}", response_model=ProjectResponse)
async def get_public_project_detail(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtiene detalle de un proyecto público.
    Acceso público sin autenticación.

    **RF5.3 - Galería Comunitaria**
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.is_public == True
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto público no encontrado"
        )

    # Agregar contadores
    project.likes_count = 0
    project.forks_count = db.query(func.count(Project.id)).filter(
        Project.fork_from_id == project.id
    ).scalar() or 0
    project.owner_name = project.owner.username if project.owner else None

    return project
