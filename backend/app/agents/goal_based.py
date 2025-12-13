# backend/app/agents/goal_based.py
from .base import Agent
from ..algorithms.search import SearchAlgorithms

class GoalBasedAgent(Agent):
    def __init__(self, id, x, y):
        super().__init__(id, x, y, "#3b82f6") # Azul para inteligentes
        self.current_plan = [] # Memoria del camino planeado

    def decide_move(self, world_state):
        # 1. Si tengo un plan en curso, síguelo
        if self.current_plan:
            next_step = self.current_plan.pop(0) # Saca el siguiente paso
            dx = next_step[0] - self.x
            dy = next_step[1] - self.y
            return (dx, dy)

        # 2. Si no tengo plan, busca la comida más cercana
        if world_state['food']:
            target = (world_state['food'][0]['x'], world_state['food'][0]['y']) # Elige la primera comida (simple)
            
            # --- AQUÍ USAS TU ALGORITMO (A*, BFS, DFS) ---
            start = (self.x, self.y)
            path = SearchAlgorithms.a_star(
                start, 
                target, 
                world_state['width'], 
                world_state['height'], 
                world_state['obstacles']
            )

            if len(path) > 1:
                self.current_plan = path[1:] # Ignoramos la posición actual
                return self.decide_move(world_state) # Llamada recursiva para dar el primer paso ya

        return (0, 0) # Quedarse quieto si no hay comida o camino