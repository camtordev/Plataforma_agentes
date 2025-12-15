# Importamos la clase de simulation.py
from app.simulation import SimulationEngine 

# Creamos la instancia ÚNICA (Singleton)
# Esta variable 'global_engine' es la que mantendrá el juego vivo en memoria
global_engine = SimulationEngine()

def get_engine():
    """Retorna la instancia activa del juego"""
    return global_engine
from app.simulation import SimulationEngine 

# Creamos la instancia ÚNICA (Singleton)
# Esta variable 'global_engine' es la que mantendrá el juego vivo en memoria
global_engine = SimulationEngine()

def get_engine():
    """Retorna la instancia activa del juego"""
    return global_engine