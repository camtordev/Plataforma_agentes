# Importamos la clase de simulation.py
from app.simulation import SimulationEngine

# Almacenamos instancias aisladas: clave = project_id + instance_id
_engines = {}


def _make_key(project_id=None, instance_id=None):
    project_key = str(project_id) if project_id else "default"
    instance_key = str(instance_id) if instance_id else "default"
    return f"{project_key}::{instance_key}"


def get_engine(project_id=None, instance_id=None):
    """
    Retorna la instancia activa del juego para un proyecto e instancia.
    Si no hay project_id/instance_id, usa un motor por defecto.
    """
    key = _make_key(project_id, instance_id)
    if key not in _engines:
        _engines[key] = SimulationEngine()
    return _engines[key]


def release_engine(project_id=None, instance_id=None):
    """Elimina una instancia específica para liberar memoria."""
    key = _make_key(project_id, instance_id)
    if key in _engines:
        _engines.pop(key, None)
