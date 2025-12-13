# backend/app/agents/base.py

class Agent:
    def __init__(self, id, x, y, color="#ffffff"):
        self.id = id
        self.x = x
        self.y = y
        self.color = color
        self.energy = 100
        self.vision_radius = 5

    def perceive(self, world_state):
        """
        El agente recibe el estado completo y filtra lo que puede ver.
        Por defecto, ve todo.
        """
        return world_state

    def decide_move(self, world_state):
        """
        Lógica vacía. Los hijos (Reactive, Goal, etc.) deben sobrescribir esto.
        Devuelve (dx, dy).
        """
        return (0, 0) 

    def to_dict(self):
        """Serializa el agente para enviarlo al Frontend por JSON"""
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "color": self.color,
            "energy": self.energy
        }