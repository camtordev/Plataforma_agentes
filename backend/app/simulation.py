import random
import math
from typing import List, Dict, Any
from .agents.factory import AgentFactory
# IMPORTANTE: Asegúrate de que el archivo pathfinding.py exista en app/algorithms/
from .algorithms.pathfinding import Pathfinding

class SimulationEngine:
    def __init__(self):
        self.width = 25
        self.height = 25
        self.agents = []    # Lista de instancias de objetos (Agent)
        self.food = []      # Lista de diccionarios
        self.obstacles = [] # Lista de diccionarios
        self.messages = []  # Buzón global para agentes cooperativos
        self.is_running = False
        self.step_count = 0
        self.speed = 0.5 
        
        # --- VARIABLES DE CONFIGURACIÓN ---
        self.max_steps = 100     # Límite por defecto
        self.is_unlimited = False # Si es True, ignora el límite
        self.stop_on_food = True  # Detener si no hay comida
        
        # Q-Learning Global Table (Simple version)
        self.q_table = {} 

    def reset(self):
        """Reinicia la simulación, pero MANTIENE la configuración (max_steps, etc)."""
        self.agents = []
        self.food = []
        self.obstacles = []
        self.messages = []
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

    # --- AGREGAR AGENTE (Configuración + Factory) ---
    def add_agent(self, x: int, y: int, agent_type: str = "reactive", strategy: str = "bfs", config: Dict = None):
        if not self._is_occupied(x, y):
            new_id = f"agent_{len(self.agents)}"
            try:
                # Creamos el agente usando el Factory
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

    # --- AGREGAR COMIDA ---
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

    # --- AGREGAR OBSTÁCULO ---
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

    # =========================================================================
    # LÓGICA CENTRAL DE TOMA DE DECISIONES DE LOS AGENTES (CEREBROS)
    # =========================================================================
    def _get_agent_decision(self, agent, world_state):
        # Intentamos obtener la estrategia, default a bfs
        strategy = getattr(agent, "strategy", "bfs")
        
        # Normalizamos el tipo de agente para el switch
        agent_type_class = agent.__class__.__name__.lower()
        if hasattr(agent, "type") and agent.type:
             type_str = agent.type.lower()
        else:
             type_str = "reactive" # Default

        # 1. AGENTE REACTIVO (Solo ve vecinos)
        if "reactive" in type_str:
            # Buscar comida adyacente
            for dx, dy in [(0,1), (0,-1), (1,0), (-1,0)]:
                nx, ny = agent.x + dx, agent.y + dy
                for f in self.food:
                    if f['x'] == nx and f['y'] == ny:
                        return dx, dy
            # Si no, movimiento aleatorio válido
            valid_moves = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
            if valid_moves:
                next_pos = random.choice(valid_moves)
                return next_pos[0] - agent.x, next_pos[1] - agent.y
            return 0, 0

        # 2. AGENTE EXPLORADOR (Con Memoria)
        elif "explorer" in type_str:
            # Inicializar memoria si no existe
            if not hasattr(agent, "visited"): agent.visited = set()
            agent.visited.add((agent.x, agent.y))
            
            valid_moves = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
            # Priorizar no visitados
            unvisited = [m for m in valid_moves if m not in agent.visited]
            
            if unvisited:
                target = random.choice(unvisited)
            elif valid_moves:
                target = random.choice(valid_moves) # Backtracking simple
            else:
                return 0,0
            return target[0] - agent.x, target[1] - agent.y

        # 3. AGENTE RECOLECTOR (Planificador - A*, BFS, etc.)
        elif "collector" in type_str:
            # Buscar comida más cercana (Objetivo)
            target_food = None
            min_dist = float('inf')
            
            for f in self.food:
                dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
                if dist < min_dist:
                    min_dist = dist
                    target_food = (f['x'], f['y'])
            
            if target_food:
                start = (agent.x, agent.y)
                dx, dy = 0, 0
                
                # Ejecutar algoritmo seleccionado
                if strategy == "bfs":
                    dx, dy = Pathfinding.bfs(start, target_food, self.width, self.height, self.obstacles)
                elif strategy == "dfs":
                    dx, dy = Pathfinding.dfs(start, target_food, self.width, self.height, self.obstacles)
                elif strategy == "dijkstra":
                    dx, dy = Pathfinding.dijkstra(start, target_food, self.width, self.height, self.obstacles)
                elif strategy == "astar":
                    dx, dy = Pathfinding.a_star(start, target_food, self.width, self.height, self.obstacles)
                else:
                    # Default a BFS si la estrategia falla
                    dx, dy = Pathfinding.bfs(start, target_food, self.width, self.height, self.obstacles)

                return dx, dy
            
            return 0, 0 

        # 4. AGENTE COOPERATIVO (Comunicación)
        elif "cooperative" in type_str:
            # Lógica simple: Si hay mensajes globales de comida, ir allí.
            # Si no, comportarse como explorador.
            target = None
            
            # Revisar buzón global (Simulación de radio)
            if self.messages:
                last_msg = self.messages[-1] # Tomar el último mensaje
                target = last_msg.get("pos")
            
            if target:
                 start = (agent.x, agent.y)
                 dx, dy = Pathfinding.a_star(start, target, self.width, self.height, self.obstacles)
                 return dx, dy
            else:
                # Comportamiento explorador fallback
                valid_moves = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
                if valid_moves:
                    next_pos = random.choice(valid_moves)
                    return next_pos[0] - agent.x, next_pos[1] - agent.y
            return 0, 0

        # 5. AGENTE COMPETITIVO (Agresivo)
        elif "competitive" in type_str:
            # Prioriza comida sobre todo, usando A* siempre (es el más rápido)
            target_food = None
            min_dist = float('inf')
            
            for f in self.food:
                dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
                if dist < min_dist:
                    min_dist = dist
                    target_food = (f['x'], f['y'])
            
            if target_food:
                start = (agent.x, agent.y)
                dx, dy = Pathfinding.a_star(start, target_food, self.width, self.height, self.obstacles)
                return dx, dy
            
            # Si no hay comida, moverse aleatoriamente para no gastar cómputo
            return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

        # 6. AGENTE Q-LEARNING (RL)
        elif "q_learning" in type_str or "rl" in type_str:
            # Placeholder: Movimiento aleatorio hasta implementar tabla Q completa
            # En un sistema real, aquí consultarías self.q_table[state]
            return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

        return 0, 0

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
        
        # Limpiar mensajes antiguos (TTL simple de 1 turno)
        self.messages = []

        # Snapshot del mundo
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
            
            # --- FASE 1: DECIDIR INTENCIÓN ---
            dx, dy = self._get_agent_decision(agent, world_state)
            
            # --- FASE 2: RESOLUCIÓN DE CONFLICTOS Y APLICACIÓN ---
            new_x = max(0, min(self.width - 1, agent.x + dx))
            new_y = max(0, min(self.height - 1, agent.y + dy))

            # 1. Colisión con Obstáculos
            collision_obs = False
            for obs in self.obstacles:
                if obs['x'] == new_x and obs['y'] == new_y:
                    collision_obs = True
                    break
            
            if not collision_obs:
                # 2. Colisión con Agentes
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

            # 3. Interacción con Recursos (Comer)
            for f in self.food[:]:
                if f['x'] == agent.x and f['y'] == agent.y:
                    energy_gain = f.get("value", 20)
                    agent.energy = min(150, agent.energy + energy_gain) 
                    self.food.remove(f)
                    
                    # SI ES COOPERATIVO: Avisar donde encontró comida (para otros turnos)
                    # En una simulación real, avisaría ANTES de comer, o avisaría de comida adyacente.
                    # Aquí simplificamos: avisa "hubo comida aquí" (útil si hay clusters).
                    if "cooperative" in getattr(agent, "type", "").lower():
                        self.messages.append({"pos": (agent.x, agent.y), "from": agent.id})

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