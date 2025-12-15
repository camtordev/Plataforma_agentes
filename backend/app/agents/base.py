# backend/app/agents/base.py

class Agent:
    # --- CAMBIO IMPORTANTE: Añadimos **kwargs al final ---
    def __init__(self, agent_id: str, x: int, y: int, **kwargs):
        self.id = agent_id
        self.x = x
        self.y = y
        self.energy = kwargs.get("initialEnergy", 100) # Usamos kwargs para energía si viene
        self.color = kwargs.get("color", "#22d3ee")    # Usamos kwargs para color si viene
        
        # Guardamos la estrategia si nos la mandan (útil para agentes complejos)
        self.strategy = kwargs.get("strategy", None)

    def decide_move(self, world_state: dict):
        # Lógica por defecto (moverse random o quedarse quieto)
        return 0, 0
        
    def to_dict(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "energy": self.energy,
            "color": self.color,
            "type": self.__class__.__name__
        }