import random
import math
from typing import List, Dict, Any, Tuple
from .agents.factory import AgentFactory
# Asegúrate de que este archivo existe (lo creamos en pasos anteriores)
from .algorithms.pathfinding import Pathfinding
# Asegúrate de que este archivo existe (lo creamos en pasos recientes)
from .services.sandbox.executor import execute_custom_agent_code

class SimulationEngine:
    def __init__(self):
        self.width = 25
        self.height = 25
        self.agents = []    # Lista de objetos Agent
        self.food = []      # Lista de diccionarios
        self.obstacles = [] # Lista de diccionarios
        self.messages = []  # Buzón global
        self.is_running = False
        self.step_count = 0
        self.speed = 0.5 
        
        # Configuración
        self.max_steps = 100
        self.is_unlimited = False
        self.stop_on_food = True
        self.q_table = {}

    # --- GESTIÓN DE ESTADO ---
    def reset(self):
        self.agents = []
        self.food = []
        self.obstacles = []
        self.messages = []
        self.step_count = 0
        self.is_running = False

    def update_dimensions(self, width: int, height: int):
        self.width = width
        self.height = height
        self.reset()

    def update_config(self, config: Dict[str, Any]):
        print(f"🔧 Configuración actualizada: {config}")
        if "maxSteps" in config: self.max_steps = int(config["maxSteps"])
        if "isUnlimited" in config: self.is_unlimited = bool(config["isUnlimited"])
        if "stopOnFood" in config: self.stop_on_food = bool(config["stopOnFood"])
        if "speed" in config and float(config["speed"]) > 0: self.speed = 0.5 / float(config["speed"])

    # --- GESTIÓN DE ENTIDADES ---
    def add_agent(self, x: int, y: int, agent_type: str = "reactive", strategy: str = "bfs", config: Dict = None):
        if self._is_occupied(x, y): return
        
        try:
            new_id = f"agent_{len(self.agents)}"
            agent = AgentFactory.create_agent(agent_type, new_id, x, y, strategy=strategy)
            
            if config:
                if "color" in config: agent.color = config["color"]
                if "initialEnergy" in config: agent.energy = int(config["initialEnergy"])
                if "speed" in config: agent.speed = int(config["speed"])
                if "visionRadius" in config and hasattr(agent, "vision_radius"):
                    agent.vision_radius = int(config["visionRadius"])

            self.agents.append(agent)
        except Exception as e:
            print(f"❌ Error creando agente: {e}")

    def add_food(self, x: int, y: int, food_type: str = "food", config: Dict = None):
        if self._is_occupied(x, y): return
        
        value = 20
        if config and "nutritionValue" in config:
            value = int(config["nutritionValue"])

        self.food.append({
            "x": x, "y": y, 
            "id": f"food_{len(self.food)}", 
            "type": food_type,
            "value": value
        })

    def add_obstacle(self, x: int, y: int, obs_type: str = "static", config: Dict = None):
        if self._is_occupied(x, y): return
        
        # Guardamos el tipo para saber cuál mover después
        obs = {
            "x": x, 
            "y": y, 
            "type": obs_type,  # <--- GUARDAMOS EL TIPO
            "destructible": False, 
            "cost": 5
        }
        
        if config:
            obs["destructible"] = bool(config.get("isDestructible", False))
            obs["cost"] = int(config.get("destructionCost", 5))
        
        self.obstacles.append(obs)
    
    # Lógica de movimiento para obstáculos
    def _update_dynamic_obstacles(self):
        """Mueve los obstáculos dinámicos aleatoriamente."""
        for obs in self.obstacles:
            # Solo movemos los que sean de tipo 'dynamic'
            if obs.get("type") == "dynamic":
                
                # Intentamos movernos en una dirección aleatoria
                moves = [(0,1), (0,-1), (1,0), (-1,0)]
                random.shuffle(moves) # Mezclar para variedad
                
                for dx, dy in moves:
                    new_x = obs["x"] + dx
                    new_y = obs["y"] + dy
                    
                    # Verificar límites del mapa
                    if 0 <= new_x < self.width and 0 <= new_y < self.height:
                        # Verificar que no esté ocupado (por agentes, comida u otros obstáculos)
                        # Nota: Usamos una verificación manual para no chocar con nada
                        if not self._is_occupied(new_x, new_y):
                            obs["x"] = new_x
                            obs["y"] = new_y
                            break # Ya se movió, pasamos al siguiente obstáculo

    def remove_at(self, x: int, y: int):
        self.agents = [a for a in self.agents if not (a.x == x and a.y == y)]
        self.food = [f for f in self.food if not (f['x'] == x and f['y'] == y)]
        self.obstacles = [o for o in self.obstacles if not (o['x'] == x and o['y'] == y)]

    def _is_occupied(self, x: int, y: int) -> bool:
        # Helper rápido para verificar colisiones estáticas al colocar cosas
        return any(a.x == x and a.y == y for a in self.agents) or \
               any(f['x'] == x and f['y'] == y for f in self.food) or \
               any(o['x'] == x and o['y'] == y for o in self.obstacles)

    # =========================================================================
    # LÓGICA DE IA (CEREBROS)
    # =========================================================================
    
    # --- Helper para construir la "visión" del agente personalizado ---
    def _build_perception(self, agent) -> dict:
        vr = getattr(agent, "vision_radius", 5)
        
        nearby_food = []
        for f in self.food:
            if abs(f['x'] - agent.x) <= vr and abs(f['y'] - agent.y) <= vr:
                nearby_food.append((f['x'], f['y']))
                
        nearby_obstacles = []
        for o in self.obstacles:
            if abs(o['x'] - agent.x) <= vr and abs(o['y'] - agent.y) <= vr:
                nearby_obstacles.append((o['x'], o['y']))
        
        return {
            "x": agent.x,
            "y": agent.y,
            "energy": agent.energy,
            "vision_radius": vr,
            "grid_width": self.width,
            "grid_height": self.height,
            "nearby_food": nearby_food,
            "nearby_obstacles": nearby_obstacles
        }

    def _get_agent_decision(self, agent, world_state) -> Tuple[int, int]:
        """Despacha la decisión al método correspondiente según el tipo de agente."""
        agent_type = getattr(agent, "type", "reactive").lower()
        
        # Mapeo dinámico de estrategias
        strategies = {
            "reactive": self._logic_reactive,
            "explorer": self._logic_explorer,
            "collector": self._logic_collector,
            "cooperative": self._logic_cooperative,
            "competitive": self._logic_competitive,
            "q_learning": self._logic_q_learning,
            "custom": self._logic_custom # <--- Agente Personalizado
        }
        
        # Buscar la función adecuada (o usar reactive por defecto)
        logic_func = next((func for key, func in strategies.items() if key in agent_type), self._logic_reactive)
        return logic_func(agent, world_state)

    def _logic_reactive(self, agent, ws):
        # 1. Buscar comida adyacente
        for dx, dy in [(0,1), (0,-1), (1,0), (-1,0)]:
            nx, ny = agent.x + dx, agent.y + dy
            if any(f['x'] == nx and f['y'] == ny for f in self.food):
                return dx, dy
        # 2. Movimiento aleatorio válido
        valid = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
        if valid:
            nx, ny = random.choice(valid)
            return nx - agent.x, ny - agent.y
        return 0, 0

    def _logic_explorer(self, agent, ws):
        if not hasattr(agent, "visited"): agent.visited = set()
        agent.visited.add((agent.x, agent.y))
        
        valid = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
        unvisited = [pos for pos in valid if pos not in agent.visited]
        
        target = random.choice(unvisited) if unvisited else (random.choice(valid) if valid else None)
        
        if target: return target[0] - agent.x, target[1] - agent.y
        return 0, 0

    def _logic_collector(self, agent, ws):
        target = self._find_nearest_food(agent)
        if target:
            return self._calculate_path(agent, target, getattr(agent, "strategy", "bfs"))
        return 0, 0

    def _logic_cooperative(self, agent, ws):
        # Prioridad: Mensajes > Comida cercana > Explorar
        target = None
        if self.messages:
            target = self.messages[-1].get("pos")
        
        if not target:
            # Si no hay mensajes, comportarse como recolector
            target = self._find_nearest_food(agent)

        if target:
            # Usar A* para ser eficiente ayudando
            return self._calculate_path(agent, target, "astar")
        
        # Si no hay nada, explorar
        return self._logic_explorer(agent, ws)

    def _logic_competitive(self, agent, ws):
        # Muy agresivo con la comida usando A*
        target = self._find_nearest_food(agent)
        if target:
            return self._calculate_path(agent, target, "astar")
        # Movimiento aleatorio si no hay comida
        return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

    def _logic_q_learning(self, agent, ws):
        # Placeholder
        return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

    def _logic_custom(self, agent, ws):
        """Ejecuta el código Python enviado por el usuario."""
        if not getattr(agent, "custom_code", None):
             return 0, 0

        # Construir percepción (lo que ve el agente)
        perception = self._build_perception(agent)
        
        # Ejecutar en el Sandbox
        dx, dy = execute_custom_agent_code(agent.custom_code, perception)
        return dx, dy

    # --- HELPERS DE IA ---
    def _find_nearest_food(self, agent):
        target = None
        min_dist = float('inf')
        for f in self.food:
            dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
            if dist < min_dist:
                min_dist = dist
                target = (f['x'], f['y'])
        return target

    def _calculate_path(self, agent, target, strategy):
        start = (agent.x, agent.y)
        
        methods = {
            "bfs": Pathfinding.bfs,
            "dfs": Pathfinding.dfs,
            "dijkstra": Pathfinding.dijkstra,
            "astar": Pathfinding.a_star
        }
        
        algo = methods.get(strategy, Pathfinding.bfs)
        return algo(start, target, self.width, self.height, self.obstacles)

    # =========================================================================
    # BUCLE PRINCIPAL (FÍSICA Y REGLAS)
    # =========================================================================
    def step(self):
        if self._check_stop_conditions():
            return

        self.step_count += 1
        self.messages = [] 

        # --- A. MOVER OBSTÁCULOS DINÁMICOS ---
        # Lo hacemos antes que los agentes para añadir dificultad
        self._update_dynamic_obstacles()

        # Snapshot para decisiones
        world_state = {
            "food": self.food,
            "obstacles": self.obstacles,
            "agents": [a.to_dict() for a in self.agents]
        }

        for agent in self.agents:
            if agent.energy <= 0: continue

            # 1. DECISIÓN
            dx, dy = self._get_agent_decision(agent, world_state)

            # 2. ACCIÓN
            self._apply_movement(agent, dx, dy)
            
            # 3. INTERACCIÓN
            self._handle_interactions(agent)

        if self._check_stop_conditions():
            return

    def _apply_movement(self, agent, dx, dy):
        """Aplica movimiento resolviendo colisiones y destrucción de obstáculos."""
        new_x = max(0, min(self.width - 1, agent.x + dx))
        new_y = max(0, min(self.height - 1, agent.y + dy))

        # 1. VERIFICAR OBSTÁCULOS (Y DESTRUCCIÓN)
        # Buscamos si hay un obstáculo en la casilla destino
        obstacle = next((o for o in self.obstacles if o['x'] == new_x and o['y'] == new_y), None)
        
        if obstacle:
            # Si es destructible y el agente tiene suficiente energía
            cost = obstacle.get("cost", 5)
            is_destructible = obstacle.get("destructible", False) or obstacle.get("type") == "dynamic" # Asumimos dinámicos destructibles también
            
            if is_destructible and agent.energy > cost:
                # DESTRUCCIÓN EXITOSA
                agent.energy -= cost
                self.obstacles.remove(obstacle) # Eliminar del mundo
                print(f"💥 Obstáculo destruido en ({new_x}, {new_y}) por {agent.id}")
                # Nota: En este turno destruye el obstáculo pero NO se mueve a la casilla
                # (gasta el turno rompiendo la pared). En el siguiente turno podrá avanzar.
                return 
            else:
                # CHOQUE (No destructible o sin energía)
                agent.energy -= 0.1 
                return

        # 2. VERIFICAR OTROS AGENTES
        if any(a.id != agent.id and a.x == new_x and a.y == new_y for a in self.agents):
            return # Bloqueado por otro agente

        # 3. MOVIMIENTO EXITOSO
        agent.x = new_x
        agent.y = new_y
        agent.energy -= 0.5 # Costo base por moverse
        
        # --- NUEVO: ACTUALIZAR ESTADÍSTICAS ---
        agent.steps_taken += 1
        agent.path_history.append((new_x, new_y))

    def _handle_interactions(self, agent):
        """Maneja comer y comunicar."""
        for f in self.food[:]:
            if f['x'] == agent.x and f['y'] == agent.y:
                gain = f.get("value", 20)
                agent.energy = min(150, agent.energy + gain)
                self.food.remove(f)
                
                # Comunicación (Si es cooperativo)
                if "cooperative" in getattr(agent, "type", "").lower():
                    self.messages.append({"pos": (agent.x, agent.y), "from": agent.id})

    def _check_stop_conditions(self):
        if not self.is_unlimited and self.step_count >= self.max_steps:
            self.is_running = False
            return True
        if self.stop_on_food and len(self.food) == 0 and len(self.agents) > 0:
            self.is_running = False
            return True
        return False

    def get_state(self) -> Dict[str, Any]:
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

    # --- Cargar estado desde snapshot (para import/export) ---
    def load_state(self, state: Dict[str, Any]):
        """
        Restaura el estado completo del engine desde un snapshot.
        Espera claves: width, height, agents, food, obstacles, config.
        """
        try:
            self.width = int(state.get("width", self.width))
            self.height = int(state.get("height", self.height))
        except Exception:
            pass

        self.reset()
        self.width = state.get("width", self.width)
        self.height = state.get("height", self.height)

        # Restaurar configuraciÇün
        cfg = state.get("config") or {}
        if cfg:
            self.update_config(cfg)

        # Restaurar comida y obstÇ­culos
        self.food = state.get("food", [])
        self.obstacles = state.get("obstacles", [])

        # Restaurar agentes
        self.agents = []
        for a in state.get("agents", []):
            try:
                agent = AgentFactory.create_agent(
                    getattr(a, "type", None) or a.get("type", "reactive"),
                    a.get("id", f"agent_{len(self.agents)}"),
                    int(a.get("x", 0)),
                    int(a.get("y", 0)),
                    strategy=a.get("strategy", "bfs"),
                )
                if hasattr(agent, "energy"):
                    agent.energy = a.get("energy", getattr(agent, "energy", 100))
                if hasattr(agent, "speed"):
                    agent.speed = a.get("speed", getattr(agent, "speed", 1))
                if hasattr(agent, "vision_radius"):
                    agent.vision_radius = a.get("vision_radius", getattr(agent, "vision_radius", 3))
                if hasattr(agent, "color"):
                    agent.color = a.get("color", getattr(agent, "color", "#22d3ee"))
                self.agents.append(agent)
            except Exception:
                continue
