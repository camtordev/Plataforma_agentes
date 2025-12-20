# backend/app/db/models/user.py
"""
MÓDULO 1: AUTENTICACIÓN Y USUARIOS
Tablas: users, roles, user_sessions
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base


class Role(Base):
    """
    Roles de usuario: student, teacher, admin
    Gestiona permisos y niveles de acceso
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    permissions = Column(JSONB, default={})

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"


class User(Base):
    """
    Usuarios registrados en la plataforma
    Almacena credenciales, perfil y estadísticas
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Perfil
    full_name = Column(String(100))
    avatar_url = Column(String(500))
    bio = Column(Text)

    # Rol y estado
    role_id = Column(Integer, ForeignKey(
        'roles.id'), nullable=False, default=1)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime)

    # Contadores denormalizados (performance)
    total_projects = Column(Integer, default=0, nullable=False)
    total_likes_received = Column(Integer, default=0, nullable=False)
    total_followers = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    last_login_at = Column(DateTime)

    # Relaciones
    role = relationship("Role", back_populates="users")
    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan")
    projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan", lazy="select")
    progress = relationship(
        "UserProgress", back_populates="user", cascade="all, delete-orphan", lazy="select")
    achievements = relationship(
        "UserAchievement", back_populates="user", cascade="all, delete-orphan", lazy="select")
    project_collaborations = relationship(
        "ProjectCollaborator", foreign_keys="ProjectCollaborator.user_id", back_populates="user", lazy="select")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class UserSession(Base):
    """
    Sesiones activas de usuarios (JWT tracking)
    Permite invalidar tokens y gestionar sesiones
    """
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)

    # JWT tokens
    token_jti = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(500))

    # Metadata de sesión
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)

    # Estado
    is_active = Column(Boolean, default=True, nullable=False)

    # Expiración
    expires_at = Column(DateTime, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, active={self.is_active})>"
