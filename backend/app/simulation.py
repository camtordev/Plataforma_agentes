from typing import List, Dict, Any
from .agents.factory import AgentFactory

class SimulationEngine:
    def __init__(self):
        self.width = 25
        self.height = 25
        self.agents = []    # Lista de instancias de objetos (Agent)
        self.food = []      # Lista de diccionarios
        self.obstacles = [] # Lista de diccionarios
        self.is_running = False
        self.step_count = 0
        self.speed = 0.5 
        
        # --- VARIABLES DE CONFIGURACIÓN ---
        self.max_steps = 100     # Límite por defecto
        self.is_unlimited = False # Si es True, ignora el límite
        self.stop_on_food = True  # Detener si no hay comida

    def reset(self):
        """Reinicia la simulación, pero MANTIENE la configuración (max_steps, etc)."""
        self.agents = []
        self.food = []
        self.obstacles = []
        self.step_count = 0
        self.is_running = False
        # NOTA: No reseteamos max_steps ni is_unlimited aquí para que persistan

    def update_dimensions(self, width: int, height: int):
        self.width = width
        self.height = height
        self.reset()

    def update_config(self, config: Dict[str, Any]):
        """
        Actualiza la configuración y muestra logs para depuración.
        """
        print(f"🔧 RECIBIENDO CONFIG: {config}") # <-- DEBUG LOG
        
        if "maxSteps" in config:
            try:
                self.max_steps = int(config["maxSteps"])
                print(f"   ✅ Max Steps actualizado a: {self.max_steps}")
            except ValueError:
                print("   ❌ Error: maxSteps no es un número válido")
        
        if "isUnlimited" in config:
            self.is_unlimited = bool(config["isUnlimited"])
            print(f"   ✅ Unlimited actualizado a: {self.is_unlimited}")
            
        if "stopOnFood" in config:
            self.stop_on_food = bool(config["stopOnFood"])
            print(f"   ✅ StopOnFood actualizado a: {self.stop_on_food}")

        if "speed" in config:
            spd = float(config["speed"])
            if spd > 0: self.speed = 0.5 / spd

    def add_agent(self, x: int, y: int, agent_type: str = "reactive", **kwargs):
        if not self._is_occupied(x, y):
            new_id = f"agent_{len(self.agents)}"
            try:
                agent = AgentFactory.create_agent(agent_type, new_id, x, y, **kwargs)
                self.agents.append(agent)
            except ValueError as e:
                print(f"Error creating agent: {e}")

    def add_food(self, x: int, y: int):
        if not self._is_occupied(x, y):
            self.food.append({"x": x, "y": y, "id": f"food_{len(self.food)}"})

    def add_obstacle(self, x: int, y: int):
        if not self._is_occupied(x, y):
            self.obstacles.append({"x": x, "y": y})

    def remove_at(self, x: int, y: int):
        self.agents = [a for a in self.agents if not (a.x == x and a.y == y)]
        self.food = [f for f in self.food if not (f['x'] == x and f['y'] == y)]
        self.obstacles = [o for o in self.obstacles if not (o['x'] == x and o['y'] == y)]

    def _is_occupied(self, x: int, y: int) -> bool:
        for a in self.agents:
            if a.x == x and a.y == y: return True
        for f in self.food:
            if f['x'] == x and f['y'] == y: return True
        for o in self.obstacles:
            if o['x'] == x and o['y'] == y: return True
        return False

    def step(self):
        """Ciclo principal de la simulación."""
        
        # 1. VERIFICACIÓN INICIAL DE LÍMITES
        # Si NO es ilimitado Y ya pasamos los pasos -> Detener
        if not self.is_unlimited and self.step_count >= self.max_steps:
            self.is_running = False
            return

        # Si detener al acabar comida está activo Y no hay comida -> Detener
        if self.stop_on_food and len(self.food) == 0 and len(self.agents) > 0:
            # (Agregamos len(agents)>0 para que no se pare si apenas estamos construyendo el mapa)
            self.is_running = False
            return

        self.step_count += 1
        
        world_state = {
            "food": self.food,
            "obstacles": self.obstacles,
            "agents": [a.to_dict() for a in self.agents], 
            "width": self.width,
            "height": self.height
        }

        for agent in self.agents:
            if agent.energy <= 0:
                continue

            dx, dy = agent.decide_move(world_state)
            
            new_x = max(0, min(self.width - 1, agent.x + dx))
            new_y = max(0, min(self.height - 1, agent.y + dy))

            collision = False
            for obs in self.obstacles:
                if obs['x'] == new_x and obs['y'] == new_y:
                    collision = True
                    break
            
            if not collision:
                agent.x = new_x
                agent.y = new_y
                agent.energy -= 0.5
            else:
                agent.energy -= 0.1

            for f in self.food[:]:
                if f['x'] == agent.x and f['y'] == agent.y:
                    agent.energy = min(100, agent.energy + 20)
                    self.food.remove(f)

        # 2. VERIFICACIÓN FINAL POST-MOVIMIENTO
        # ¿Se acabó la comida en este turno?
        if self.stop_on_food and len(self.food) == 0 and len(self.agents) > 0:
            self.is_running = False

        # ¿Llegamos al límite?
        if not self.is_unlimited and self.step_count >= self.max_steps:
            self.is_running = False

    def get_state(self) -> Dict[str, Any]:
        """Envía el estado, INCLUYENDO la configuración actual para depurar en frontend."""
        return {
            "type": "WORLD_UPDATE",
            "data": {
                "step": self.step_count,
                "agents": [a.to_dict() for a in self.agents],
                "food": self.food,
                "obstacles": self.obstacles,
                "width": self.width,
                "height": self.height,
                "isRunning": self.is_running,
                # Enviamos la config de vuelta para verificar sincronización
                "config": {
                    "maxSteps": self.max_steps,
                    "isUnlimited": self.is_unlimited,
                    "stopOnFood": self.stop_on_food
                }
            }
        }