from app.simulation import SimulationEngine

# Instancia global única del motor
# Esto permite importarlo desde los websockets, la API REST, etc.
global_engine = SimulationEngine()

def get_engine():
    return global_engine