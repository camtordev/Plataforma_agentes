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
        print(f"🔧 RECIBIENDO CONFIG: {config}") 
        
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

    # --- MÉTODO CORREGIDO: Acepta config explícitamente ---
    def add_agent(self, x: int, y: int, agent_type: str = "reactive", strategy: str = "bfs", config: Dict = None):
        if not self._is_occupied(x, y):
            new_id = f"agent_{len(self.agents)}"
            try:
                # Creamos el agente
                agent = AgentFactory.create_agent(agent_type, new_id, x, y, strategy=strategy)
                
                # APLICAMOS LA CONFIGURACIÓN DEL FRONTEND (Si existe)
                if config:
                    if "color" in config:
                        agent.color = config["color"]
                    if "initialEnergy" in config:
                        agent.energy = int(config["initialEnergy"])
                    if "speed" in config:
                        agent.speed = int(config["speed"])
                    if "visionRadius" in config:
                        if hasattr(agent, "vision_radius"):
                            agent.vision_radius = int(config["visionRadius"])

                self.agents.append(agent)
            except ValueError as e:
                print(f"Error creating agent: {e}")

    # --- MÉTODO CORREGIDO: Ahora acepta config ---
    def add_food(self, x: int, y: int, food_type: str = "food", config: Dict = None):
        if not self._is_occupied(x, y):
            food_item = {
                "x": x,
                "y": y,
                "id": f"food_{len(self.food)}",
                # GUARDAMOS EL TIPO: "food" (Manzana) o "energy" (Rayo)
                "type": food_type 
            }
            
            # Aplicar valor nutricional
            if config and "nutritionValue" in config:
                try:
                    food_item["value"] = int(config["nutritionValue"])
                except:
                    food_item["value"] = 20
            else:
                food_item["value"] = 20

            self.food.append(food_item)
    # --- MÉTODO CORREGIDO: Ahora acepta config ---
    def add_obstacle(self, x: int, y: int, config: Dict = None):
        if not self._is_occupied(x, y):
            obs_item = {"x": x, "y": y}
            
            # Aplicar destructibilidad
            if config:
                if "isDestructible" in config:
                    obs_item["destructible"] = bool(config["isDestructible"])
                if "destructionCost" in config:
                    try:
                        obs_item["cost"] = int(config["destructionCost"])
                    except:
                        obs_item["cost"] = 5
            
            self.obstacles.append(obs_item)

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
        if not self.is_unlimited and self.step_count >= self.max_steps:
            self.is_running = False
            return

        if self.stop_on_food and len(self.food) == 0 and len(self.agents) > 0:
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
                # Verificar colisión con otros agentes
                agent_collision = False
                for other in self.agents:
                    if other.id != agent.id and other.x == new_x and other.y == new_y:
                        agent_collision = True
                        break
                
                if not agent_collision:
                    agent.x = new_x
                    agent.y = new_y
                    agent.energy -= 0.5
            else:
                agent.energy -= 0.1

            for f in self.food[:]:
                if f['x'] == agent.x and f['y'] == agent.y:
                    # Usamos el valor nutricional del objeto comida
                    energy_gain = f.get("value", 20)
                    agent.energy = min(150, agent.energy + energy_gain) # Tope de energía
                    self.food.remove(f)

        # 2. VERIFICACIÓN FINAL POST-MOVIMIENTO
        if self.stop_on_food and len(self.food) == 0 and len(self.agents) > 0:
            self.is_running = False

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
                "config": {
                    "maxSteps": self.max_steps,
                    "isUnlimited": self.is_unlimited,
                    "stopOnFood": self.stop_on_food
                }
            }
        }