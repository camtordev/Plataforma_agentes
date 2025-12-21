# Importamos la clase de simulation.py
from app.simulation import SimulationEngine

# Almacenamos una instancia por proyecto para aislar el estado
_engines = {}


def get_engine(project_id=None):
    """
    Retorna la instancia activa del juego para un proyecto.
    Si no hay project_id, usa un motor por defecto.
    """
    key = str(project_id) if project_id else "default"
    if key not in _engines:
        _engines[key] = SimulationEngine()
    return _engines[key]
