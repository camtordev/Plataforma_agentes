# Importamos la clase de simulation.py
from app.simulation import SimulationEngine

# Almacenamos instancias aisladas: clave = project_id + workspace/session_id
_engines = {}


def _normalize_session(workspace_id=None, session_id=None, instance_id=None):
    """
    Compatibilidad: workspace > session > instance.
    """
    return workspace_id or session_id or instance_id


def _make_key(project_id=None, workspace_id=None, session_id=None, instance_id=None):
    project_key = str(project_id) if project_id else "default"
    sid = _normalize_session(workspace_id, session_id, instance_id)
    session_key = str(sid) if sid else "default"
    return f"{project_key}::{session_key}"


def get_engine(project_id=None, workspace_id=None, session_id=None, instance_id=None):
    """
    Retorna la instancia activa del juego para un proyecto/sesion.
    Si no hay project_id ni sesion, usa un motor por defecto.
    """
    key = _make_key(project_id, workspace_id, session_id, instance_id)
    if key not in _engines:
        _engines[key] = SimulationEngine()
    return _engines[key]


def release_engine(project_id=None, workspace_id=None, session_id=None, instance_id=None):
    """Elimina una instancia especifica para liberar memoria."""
    key = _make_key(project_id, workspace_id, session_id, instance_id)
    if key in _engines:
        _engines.pop(key, None)
