# backend/app/db/models/metrics.py
"""
MÓDULO 4: MÉTRICAS Y ANÁLISIS
Tablas: simulation_metrics, agent_metrics, heatmap_data
Sistema de análisis de rendimiento y visualización (RF6.1)
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base


class SimulationMetrics(Base):
    """
    Métricas globales de cada simulación ejecutada (RF6.1)
    Datos agregados de toda la simulación
    """
    __tablename__ = "simulation_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey(
        'projects.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False, index=True)
    tutorial_id = Column(Integer, ForeignKey(
        'tutorials.id', ondelete='SET NULL'), nullable=True, index=True)

    # Duración de la simulación
    simulation_duration_ms = Column(Integer)  # Milisegundos
    total_steps = Column(Integer, nullable=False)
    final_step_reached = Column(Integer, nullable=False)

    # Métricas globales del mundo
    total_agents = Column(Integer, nullable=False)
    agents_survived = Column(Integer, nullable=False)
    total_food_collected = Column(Integer, default=0, nullable=False)
    total_energy_consumed = Column(Integer, default=0, nullable=False)
    total_collisions = Column(Integer, default=0, nullable=False)

    # Métricas de eficiencia
    grid_coverage_percent = Column(Numeric(5, 2))  # 0.00 a 100.00
    efficiency_score = Column(Numeric(5, 2))  # 0.00 a 100.00

    # Resultado
    success = Column(Boolean, nullable=False)

    # Timestamps
    started_at = Column(DateTime, nullable=False)
    finished_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)

    # Relaciones
    project = relationship("Project", back_populates="simulation_metrics")
    agent_metrics = relationship(
        "AgentMetrics", back_populates="simulation", cascade="all, delete-orphan")
    heatmap_data = relationship(
        "HeatmapData", back_populates="simulation", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_metrics_user_created', 'user_id', 'created_at'),
        Index('idx_metrics_tutorial', 'tutorial_id', 'created_at'),
    )

    def __repr__(self):
        return f"<SimulationMetrics(id={self.id}, project_id={self.project_id}, steps={self.total_steps}, success={self.success})>"


class AgentMetrics(Base):
    """
    Métricas individuales por agente (RF6.1)
    Performance de cada agente en la simulación
    """
    __tablename__ = "agent_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_metrics_id = Column(
        UUID(as_uuid=True),
        ForeignKey('simulation_metrics.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )

    # Identificación del agente
    agent_id = Column(String(100), nullable=False)
    agent_type = Column(String(50), nullable=False, index=True)
    # 'reactive', 'explorer', 'collector', 'cooperative', 'competitive', 'q_learning'

    # Estadísticas individuales
    steps_alive = Column(Integer, nullable=False)
    distance_traveled = Column(Integer, default=0, nullable=False)
    food_collected = Column(Integer, default=0, nullable=False)
    energy_consumed = Column(Integer, default=0, nullable=False)
    energy_at_end = Column(Integer, default=0, nullable=False)
    collisions_count = Column(Integer, default=0, nullable=False)
    cells_visited = Column(Integer, default=0, nullable=False)

    # Datos para gráficos (RF6.1)
    path_data = Column(JSONB)  # [{step: 1, x: 5, y: 3, energy: 100}, ...]
    energy_over_time = Column(JSONB)  # [100, 98, 95, 92, ...]

    # Resultado individual
    died_at_step = Column(Integer)
    # 'no_energy', 'collision', 'timeout', null
    death_reason = Column(String(50))
    success = Column(Boolean, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    simulation = relationship(
        "SimulationMetrics", back_populates="agent_metrics")

    __table_args__ = (
        Index('idx_agent_metrics_simulation_type',
              'simulation_metrics_id', 'agent_type'),
    )

    def __repr__(self):
        return f"<AgentMetrics(id={self.id}, agent_id='{self.agent_id}', type='{self.agent_type}', success={self.success})>"


class HeatmapData(Base):
    """
    Datos de mapa de calor del grid (RF6.1)
    Matriz de visitas por celda para visualización
    """
    __tablename__ = "heatmap_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_metrics_id = Column(
        UUID(as_uuid=True),
        ForeignKey('simulation_metrics.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True
    )

    # Dimensiones del grid
    grid_width = Column(Integer, nullable=False)
    grid_height = Column(Integer, nullable=False)

    # Matriz de visitas (RF6.1 - Mapa de calor)
    visit_matrix = Column(JSONB, nullable=False)
    # Ejemplo: [[0, 1, 3, 2], [5, 8, 12, 7], [3, 15, 20, 18]]
    # Cada número = cantidad de veces que se visitó esa celda

    # Metadata para normalización
    max_visits = Column(Integer, nullable=False)  # Valor máximo en la matriz

    # Top zonas más visitadas
    hotspots = Column(JSONB)  # [{x: 5, y: 8, visits: 45}, ...] Top 10

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    simulation = relationship(
        "SimulationMetrics", back_populates="heatmap_data")

    def __repr__(self):
        return f"<HeatmapData(id={self.id}, simulation_id={self.simulation_metrics_id}, grid={self.grid_width}x{self.grid_height})>"
