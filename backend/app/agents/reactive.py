# backend/app/agents/reactive.py
from .base import Agent
import random

class ReactiveAgent(Agent):
    # --- CAMBIO IMPORTANTE: Añadimos **kwargs ---
    def __init__(self, agent_id: str, x: int, y: int, **kwargs):
        # Pasamos **kwargs al padre (Agent) para que él maneje color, strategy, etc.
        super().__init__(agent_id, x, y, **kwargs)

    def decide_move(self, world_state: dict):
        # Ejemplo simple: Movimiento aleatorio
        dx = random.choice([-1, 0, 1])
        dy = random.choice([-1, 0, 1])
        return dx, dy