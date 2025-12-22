# ============================================================================
# SCHEMAS DE PYDANTIC PARA PROYECTOS
# ============================================================================
"""
Schemas de Pydantic para proyectos.
Define modelos de validación para requests y responses.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

# ============================================================================
# SCHEMAS BASE
# ============================================================================


class ProjectBase(BaseModel):
    """Schema base para proyectos"""
    title: str = Field(..., min_length=1, max_length=200,
                       description="Título del proyecto")
    description: Optional[str] = Field(
        None, description="Descripción del proyecto")
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    is_public: bool = Field(default=False, description="Visibilidad pública")
    is_template: bool = Field(default=False, description="Es plantilla")
    grid_width: int = Field(default=25, ge=10, le=100,
                            description="Ancho del grid")
    grid_height: int = Field(default=25, ge=10, le=100,
                             description="Alto del grid")
    cell_size: int = Field(default=20, ge=10, le=50,
                           description="Tamaño de celda")
    user_code: Optional[str] = Field(None, description="Código del usuario")
    code_language: str = Field(
        default="python", description="Lenguaje de programación")
    world_state: Optional[Dict[str, Any]] = Field(
        None, description="Estado del mundo")
    simulation_config: Optional[Dict[str, Any]] = Field(
        None, description="Configuración de simulación")
    agent_type: Optional[str] = Field(None, description="Tipo de agente usado")
    difficulty_level: Optional[int] = Field(
        1, ge=1, le=5, description="Nivel de dificultad 1-5")

# ============================================================================
# CREATE
# ============================================================================


class ProjectCreate(ProjectBase):
    """Schema para crear un proyecto"""
    pass

# ============================================================================
# UPDATE
# ============================================================================


class ProjectUpdate(BaseModel):
    """Schema para actualizar un proyecto (todos los campos opcionales)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None
    grid_width: Optional[int] = Field(None, ge=10, le=100)
    grid_height: Optional[int] = Field(None, ge=10, le=100)
    cell_size: Optional[int] = Field(None, ge=10, le=50)
    user_code: Optional[str] = None
    code_language: Optional[str] = None
    world_state: Optional[Dict[str, Any]] = None
    simulation_config: Optional[Dict[str, Any]] = None
    agent_type: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)


"""
Schemas de Pydantic para proyectos.
Define modelos de validación para requests y responses.
"""


# ============================================================================
# SCHEMAS BASE
# ============================================================================

class ProjectBase(BaseModel):
    """Schema base para proyectos"""
    title: str = Field(..., min_length=1, max_length=200,
                       description="Título del proyecto")
    description: Optional[str] = Field(
        None, description="Descripción del proyecto")
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    is_public: bool = Field(default=False, description="Visibilidad pública")
    is_template: bool = Field(default=False, description="Es plantilla")
    grid_width: int = Field(default=25, ge=10, le=100,
                            description="Ancho del grid")
    grid_height: int = Field(default=25, ge=10, le=100,
                             description="Alto del grid")
    cell_size: int = Field(default=20, ge=10, le=50,
                           description="Tamaño de celda")
    user_code: Optional[str] = Field(None, description="Código del usuario")
    code_language: str = Field(
        default="python", description="Lenguaje de programación")
    world_state: Optional[Dict[str, Any]] = Field(
        None, description="Estado del mundo")
    simulation_config: Optional[Dict[str, Any]] = Field(
        None, description="Configuración de simulación")
    agent_type: Optional[str] = Field(None, description="Tipo de agente usado")
    difficulty_level: Optional[int] = Field(
        1, ge=1, le=5, description="Nivel de dificultad 1-5")


# ============================================================================
    user_code: Optional[str] = None
    code_language: Optional[str] = None
    world_state: Optional[Dict[str, Any]] = None
    simulation_config: Optional[Dict[str, Any]] = None
    agent_type: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)


# ============================================================================
# RESPONSE
# ============================================================================

class ProjectResponse(ProjectBase):
    """Schema para respuesta de proyecto"""
    id: UUID
    user_id: UUID
    fork_from_id: Optional[UUID] = None
    execution_count: int
    avg_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    last_opened_at: Optional[datetime] = None

    # Relaciones contadas
    forks_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    """Schema para lista de proyectos"""
    id: UUID
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_public: bool
    agent_type: Optional[str] = None
    difficulty_level: Optional[int] = None
    execution_count: int
    forks_count: int = 0
    owner_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# VERSIONES
# ============================================================================

class ProjectVersionCreate(BaseModel):
    """Schema para crear una versión"""
    version_name: Optional[str] = Field(None, max_length=100)
    changelog: Optional[str] = Field(
        None, description="Descripción de cambios")


class ProjectVersionResponse(BaseModel):
    """Schema para respuesta de versión"""
    id: UUID
    project_id: UUID
    version_number: int
    version_name: Optional[str] = None
    user_code: Optional[str] = None
    world_state: Optional[Dict[str, Any]] = None
    simulation_config: Optional[Dict[str, Any]] = None
    changelog: Optional[str] = None
    created_at: datetime
    created_by: UUID

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# COMPARTICIÓN
# ============================================================================

class SharedProjectCreate(BaseModel):
    """Schema para crear enlace compartido"""
    expires_in_days: Optional[int] = Field(
        None, ge=1, le=365, description="Días hasta expiración")
    share_type: str = Field(
        default="view", description="Tipo de enlace: view, edit o embed")
    allow_fork: bool = Field(default=True, description="Permitir fork")
    allow_download: bool = Field(default=True, description="Permitir descarga")


class SharedProjectResponse(BaseModel):
    """Schema para enlace compartido"""
    id: UUID
    project_id: UUID
    share_token: str
    view_count: int
    fork_count: int
    allow_fork: bool
    allow_download: bool
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# EXPORTAR / IMPORTAR
# ============================================================================

class ProjectExport(ProjectBase):
    """Schema para exportar proyecto completo"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    # versionamiento eliminado

    model_config = ConfigDict(from_attributes=True)


class ProjectImport(ProjectBase):
    """Schema para importar proyecto"""
    # Hereda todos los campos de ProjectBase
    pass


# ============================================================================
# GALERÍA COMUNITARIA
# ============================================================================

class ProjectFilters(BaseModel):
    """Filtros para galería comunitaria"""
    agent_type: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    sort_by: str = Field("recent", description="recent, popular, liked")
    search: Optional[str] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)


class ProjectStats(BaseModel):
    """Estadísticas de un proyecto"""
    total_executions: int
    avg_score: Optional[float] = None
    likes_count: int
    forks_count: int
    views_count: int

