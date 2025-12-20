# backend/app/agents/models.py

from typing import Dict, Any, List

class Agent:
    def __init__(self, agent_id: str, x: int, y: int):
        self.id = agent_id
        self.x = x
        self.y = y
        
        # Propiedades por defecto
        self.energy = 100
        self.color = "#22d3ee"
        self.type = "reactive"
        self.strategy = "bfs"
        
        # Propiedades de simulación
        self.speed = 1
        self.vision_radius = 5
        self.steps_taken = 0      # Contador de pasos
        
        # Memoria interna
        self.visited = set() 
        self.inbox = [] 
        self.q_table = {}
        self.custom_code = None
        
        # Historial de movimiento (para estadísticas)
        self.path_history = [(x, y)] # Guardamos el inicio

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "energy": self.energy,
            "color": self.color,
            "type": self.type,
            "strategy": self.strategy,
            "visionRadius": self.vision_radius,
            "steps": self.steps_taken,        
            "path": self.path_history         
        }