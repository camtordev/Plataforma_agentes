# backend/app/agents/reactive.py
import random
from .base import Agent
# backend/app/agents/reactive.py
import random
from .base import Agent

class ReactiveAgent(Agent):
    def __init__(self, id, x, y):
        # Color Rojo para identificarlo
        super().__init__(id, x, y, color="#ef4444") 

    def decide_move(self, world_state):
        # 1. Buscar comida dentro de la lista 'food'
        comida_cercana = None
        min_dist = 999
        
        for f in world_state['food']:
            # Distancia Manhattan (|x1-x2| + |y1-y2|)
            dist = abs(f['x'] - self.x) + abs(f['y'] - self.y)
            
            # Si está dentro del rango de visión y es la más cercana
            if dist <= self.vision_radius and dist < min_dist:
                min_dist = dist
                comida_cercana = f

        # 2. DECISIÓN:
        # A) Si vi comida, me muevo hacia ella
        if comida_cercana:
            dx = 0
            dy = 0
            # Lógica simple para acercarse
            if comida_cercana['x'] > self.x: dx = 1
            elif comida_cercana['x'] < self.x: dx = -1
            
            if comida_cercana['y'] > self.y: dy = 1
            elif comida_cercana['y'] < self.y: dy = -1
            
            return (dx, dy)
        
        # B) Si NO vi comida, movimiento aleatorio (Random Walk)
        else:
            return random.choice([(0,1), (0,-1), (1,0), (-1,0), (0,0)])