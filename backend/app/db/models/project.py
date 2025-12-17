# backend/app/db/models/project.py
"""
MÓDULO 2: PROYECTOS
Tablas: projects, project_versions, shared_projects, project_collaborators
Gestiona simulaciones, versionado, compartición y colaboración
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base


class Project(Base):
    """
    Proyectos de simulación creados por usuarios
    Almacena código, configuración del grid, estado del mundo y estadísticas
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)

    # Información básica
    title = Column(String(200), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String(500))

    # Visibilidad y tipo
    is_public = Column(Boolean, default=False, nullable=False, index=True)
    is_template = Column(Boolean, default=False, nullable=False)

    # Fork (RF5.1 - Duplicar proyectos)
    fork_from_id = Column(UUID(as_uuid=True), ForeignKey(
        'projects.id'), nullable=True, index=True)

    # Configuración del Grid (RF1.1)
    grid_width = Column(Integer, default=25, nullable=False)
    grid_height = Column(Integer, default=25, nullable=False)
    cell_size = Column(Integer, default=20, nullable=False)

    # Código del usuario (RF3)
    user_code = Column(Text)
    code_language = Column(String(20), default='python', nullable=False)

    # Estado del mundo (RF2) - JSONB para búsquedas eficientes
    world_state = Column(JSONB)
    simulation_config = Column(JSONB)

    # Dificultad (RF5.3 - Filtros en galería)
    difficulty = Column(String(20))

    # Estadísticas sociales (RF5.3)
    views_count = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False, index=True)
    forks_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)

    # Metadata
    version_count = Column(Integer, default=1, nullable=False)
    last_opened_at = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relaciones
    owner = relationship("User", back_populates="projects")
    versions = relationship(
        "ProjectVersion", back_populates="project", cascade="all, delete-orphan")
    shared_links = relationship(
        "SharedProject", back_populates="project", cascade="all, delete-orphan")
    collaborators = relationship(
        "ProjectCollaborator", back_populates="project", cascade="all, delete-orphan")
    simulation_metrics = relationship(
        "SimulationMetrics", back_populates="project")

    # Self-referential para forks
    forks = relationship("Project", backref="parent", remote_side=[id])

    # Constraints
    __table_args__ = (
        CheckConstraint('grid_width >= 5 AND grid_width <= 50',
                        name='check_grid_width'),
        CheckConstraint('grid_height >= 5 AND grid_height <= 50',
                        name='check_grid_height'),
        CheckConstraint('cell_size >= 10 AND cell_size <= 50',
                        name='check_cell_size'),
        CheckConstraint(
            "difficulty IN ('beginner', 'intermediate', 'advanced', 'expert') OR difficulty IS NULL",
            name='check_difficulty'
        ),
        # Índice compuesto para galería pública
        Index('idx_projects_public_popular',
              'is_public', 'likes_count', 'created_at'),
        Index('idx_projects_user_created', 'user_id', 'created_at'),
    )

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', owner_id={self.user_id})>"


class ProjectVersion(Base):
    """
    Historial de versiones de proyectos (RF5.1 - Versionado)
    Snapshots del código y estado del mundo para rollback
    """
    __tablename__ = "project_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey(
        'projects.id', ondelete='CASCADE'), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)

    # Mensaje de commit (como Git)
    commit_message = Column(String(500))

    # Snapshot del proyecto
    user_code = Column(Text, nullable=False)
    world_state = Column(JSONB, nullable=False)
    simulation_config = Column(JSONB)

    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)
    file_size_bytes = Column(Integer)

    # Relaciones
    project = relationship("Project", back_populates="versions")

    __table_args__ = (
        Index('idx_versions_project_version',
              'project_id', 'version_number', unique=True),
    )

    def __repr__(self):
        return f"<ProjectVersion(id={self.id}, project_id={self.project_id}, v={self.version_number})>"


class SharedProject(Base):
    """
    URLs únicas para compartir proyectos (RF5.2 - Compartición Social)
    Genera tokens para vista, edición o embed
    """
    __tablename__ = "shared_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey(
        'projects.id', ondelete='CASCADE'), nullable=False, index=True)

    # Token único para URL
    share_token = Column(String(64), unique=True, nullable=False, index=True)
    share_type = Column(String(20), nullable=False)  # 'view', 'edit', 'embed'

    # Seguridad opcional
    password_hash = Column(String(255))

    # Límites
    expires_at = Column(DateTime, nullable=True)
    max_views = Column(Integer, nullable=True)
    current_views = Column(Integer, default=0, nullable=False)

    # Estado
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_accessed_at = Column(DateTime)

    # Relaciones
    project = relationship("Project", back_populates="shared_links")

    __table_args__ = (
        CheckConstraint(
            "share_type IN ('view', 'edit', 'embed')",
            name='check_share_type'
        ),
    )

    def __repr__(self):
        return f"<SharedProject(id={self.id}, token='{self.share_token[:8]}...', type='{self.share_type}')>"


class ProjectCollaborator(Base):
    """
    Usuarios invitados a colaborar en un proyecto
    Gestiona permisos de edición y visualización
    """
    __tablename__ = "project_collaborators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey(
        'projects.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)

    # Permisos
    # 'viewer', 'editor', 'admin'
    permission_level = Column(String(20), nullable=False)

    # Invitación
    invited_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    invited_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    accepted_at = Column(DateTime)

    # Estado
    # 'pending', 'active', 'revoked'
    status = Column(String(20), default='pending', nullable=False)

    # Relaciones
    project = relationship("Project", back_populates="collaborators")
    user = relationship("User", foreign_keys=[
                        user_id], back_populates="project_collaborations")
    inviter = relationship("User", foreign_keys=[invited_by])

    __table_args__ = (
        Index('idx_collaborators_unique', 'project_id', 'user_id', unique=True),
        CheckConstraint(
            "permission_level IN ('viewer', 'editor', 'admin')",
            name='check_permission_level'
        ),
        CheckConstraint(
            "status IN ('pending', 'active', 'revoked')",
            name='check_status'
        ),
    )

    def __repr__(self):
        return f"<ProjectCollaborator(project_id={self.project_id}, user_id={self.user_id}, level='{self.permission_level}')>"
