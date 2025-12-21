# backend/app/db/models/tutorial.py
"""
Tablas simplificadas: tutorials y user_progress
Compatibles con el script SQL proporcionado
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Tutorial(Base):
    """Tutoriales básicos, solo metadatos mínimos."""
    __tablename__ = "tutorials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(Integer, unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    user_progress = relationship("UserProgress", back_populates="tutorial")

    __table_args__ = (
        CheckConstraint('level >= 1 AND level <= 20',
                        name='check_tutorial_level'),
    )

    def __repr__(self):
        return f"<Tutorial(id={self.id}, level={self.level}, slug='{self.slug}')>"


class UserProgress(Base):
    """Progreso individual de usuarios en tutoriales."""
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)
    tutorial_id = Column(Integer, ForeignKey(
        'tutorials.id', ondelete='CASCADE'), nullable=False, index=True)

    status = Column(String(20), default='not_started', nullable=False)
    # 'not_started', 'in_progress', 'completed', 'perfect'

    # Código del usuario
    current_code = Column(Text)  # Auto-guardado
    best_attempt_code = Column(Text)  # Mejor intento

    # Estadísticas (RF4.2)
    attempts_count = Column(Integer, default=0, nullable=False)
    # Solo guardamos tiempo empleado
    time_spent_seconds = Column(Integer, default=0, nullable=False)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    tutorial = relationship("Tutorial", back_populates="user_progress")

    __table_args__ = (
        Index('idx_progress_user', 'user_id'),
        Index('idx_progress_tutorial', 'tutorial_id'),
        Index('idx_progress_status', 'status'),
        Index('idx_progress_unique', 'user_id', 'tutorial_id', unique=True),
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name='check_progress_status'
        ),
    )

    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, tutorial_id={self.tutorial_id}, status='{self.status}')>"
