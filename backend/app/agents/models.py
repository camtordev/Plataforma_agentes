from typing import Dict, Any, List

class Agent:
    def __init__(self, agent_id: str, x: int, y: int):
        self.id = agent_id
        self.x = x
        self.y = y
        
        # Propiedades por defecto
        self.energy = 100
        self.color = "#22d3ee" # Cyan por defecto
        self.type = "reactive" # Tipo de agente
        self.strategy = "bfs"  # Estrategia de búsqueda
        
        # Propiedades de simulación
        self.speed = 1
        self.vision_radius = 5
        
        # Memoria interna (Usada por Explorer, Q-Learning, etc)
        self.visited = set() 
        self.inbox = [] # Para mensajes cooperativos
        self.q_table = {} # Para Q-Learning

    def to_dict(self) -> Dict[str, Any]:
        """Convierte el agente a diccionario para enviarlo al frontend."""
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "energy": self.energy,
            "color": self.color,
            "type": self.type,
            "strategy": self.strategy,
            "visionRadius": self.vision_radius
        }