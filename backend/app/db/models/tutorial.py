# backend/app/db/models/tutorial.py
"""
MÓDULO 3: TUTORIALES EDUCATIVOS
Tablas: tutorials, user_progress, achievements, user_achievements
Sistema de aprendizaje progresivo con logros
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from decimal import Decimal
import uuid
from datetime import datetime
from app.db.base import Base


class Tutorial(Base):
    """
    Tutoriales interactivos progresivos (RF4.1)
    8 niveles de aprendizaje con teoría y práctica
    """
    __tablename__ = "tutorials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(Integer, unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Contenido educativo
    theory_content = Column(Text)  # Markdown con explicaciones
    diagram_url = Column(String(500))  # URL de imagen explicativa
    learning_objectives = Column(ARRAY(Text))  # Array de objetivos

    # Configuración inicial para el tutorial
    starter_code = Column(Text, nullable=False)
    initial_world_state = Column(JSONB, nullable=False)
    grid_config = Column(JSONB)  # {width: 15, height: 15}

    # Criterios de éxito automatizados (RF4.1)
    success_criteria = Column(JSONB, nullable=False)
    # Ejemplo: {"min_food_collected": 5, "max_steps": 100, "must_reach_goal": true}

    # Metadata
    difficulty = Column(String(20), nullable=False)
    estimated_time_minutes = Column(Integer)
    prerequisites = Column(ARRAY(Integer))  # IDs de tutoriales previos
    tags = Column(ARRAY(String(50)))

    # Estado
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    order_index = Column(Integer, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    user_progress = relationship("UserProgress", back_populates="tutorial")

    __table_args__ = (
        CheckConstraint(
            "difficulty IN ('beginner', 'intermediate', 'advanced')",
            name='check_tutorial_difficulty'
        ),
        CheckConstraint('level >= 1 AND level <= 20',
                        name='check_tutorial_level'),
    )

    def __repr__(self):
        return f"<Tutorial(id={self.id}, level={self.level}, title='{self.title}')>"


class UserProgress(Base):
    """
    Progreso individual de usuarios en tutoriales (RF4.2)
    Tracking de intentos, tiempo y eficiencia
    """
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)
    tutorial_id = Column(Integer, ForeignKey(
        'tutorials.id', ondelete='CASCADE'), nullable=False, index=True)

    # Estado del progreso
    status = Column(String(20), default='not_started', nullable=False)
    # 'not_started', 'in_progress', 'completed', 'perfect'

    # Código del usuario
    current_code = Column(Text)  # Auto-guardado
    best_attempt_code = Column(Text)  # Mejor intento

    # Estadísticas (RF4.2)
    attempts_count = Column(Integer, default=0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    lines_of_code = Column(Integer, default=0, nullable=False)
    steps_to_solution = Column(Integer)
    efficiency_score = Column(Integer)  # 0-100

    # Criterios cumplidos
    criteria_met = Column(JSONB)  # {food_collected: 5, steps_used: 87, ...}

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    last_attempt_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="progress")
    tutorial = relationship("Tutorial", back_populates="user_progress")

    __table_args__ = (
        Index('idx_progress_unique', 'user_id', 'tutorial_id', unique=True),
        Index('idx_progress_status', 'tutorial_id', 'status'),
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed', 'perfect')",
            name='check_progress_status'
        ),
        CheckConstraint(
            'efficiency_score IS NULL OR (efficiency_score >= 0 AND efficiency_score <= 100)',
            name='check_efficiency_range'
        ),
    )

    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, tutorial_id={self.tutorial_id}, status='{self.status}')>"


class Achievement(Base):
    """
    Logros desbloqueables (RF4.2 - Gamificación)
    Badges que motivan el aprendizaje
    """
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    icon_url = Column(String(500))

    # Criterios para desbloquear
    unlock_criteria = Column(JSONB, nullable=False)
    # Ejemplos:
    # {"type": "tutorial_completed", "tutorial_id": 1}
    # {"type": "efficiency_master", "min_efficiency": 95, "count": 3}
    # {"type": "speed_runner", "max_time_seconds": 120}

    # Rareza y recompensas
    rarity = Column(String(20), default='common', nullable=False)
    # 'common', 'rare', 'epic', 'legendary'
    points = Column(Integer, default=10, nullable=False)

    # Estado
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    user_achievements = relationship(
        "UserAchievement", back_populates="achievement")

    __table_args__ = (
        CheckConstraint(
            "rarity IN ('common', 'rare', 'epic', 'legendary')",
            name='check_achievement_rarity'
        ),
    )

    def __repr__(self):
        return f"<Achievement(id={self.id}, name='{self.name}', rarity='{self.rarity}')>"


class UserAchievement(Base):
    """
    Relación Many-to-Many entre usuarios y logros
    Tracking de cuándo se desbloqueó cada logro
    """
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey(
        'achievements.id', ondelete='CASCADE'), nullable=False, index=True)

    # Metadata
    unlocked_at = Column(DateTime, default=datetime.utcnow,
                         nullable=False, index=True)
    notification_seen = Column(Boolean, default=False, nullable=False)
    # Para logros progresivos (ej: "5/10 tutoriales")
    progress_data = Column(JSONB)

    # Relaciones
    user = relationship("User", back_populates="achievements")
    achievement = relationship(
        "Achievement", back_populates="user_achievements")

    __table_args__ = (
        Index('idx_user_achievements_unique',
              'user_id', 'achievement_id', unique=True),
    )

    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"
