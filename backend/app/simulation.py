import random
import math
from typing import List, Dict, Any, Tuple
from .agents.factory import AgentFactory
from .algorithms.pathfinding import Pathfinding
# Si no tienes el archivo executor, comenta la siguiente línea
# from .services.sandbox.executor import execute_custom_agent_code

class SimulationEngine:
    def __init__(self):
        self.width = 25
        self.height = 25
        self.agents = []    
        self.food = []      
        self.obstacles = [] 
        self.messages = []  # Buzón global (se limpia cada turno)
        self.claims = {}    # Registro de reclamos { (x,y): agent_id }
        self.is_running = False
        self.step_count = 0
        self.speed = 0.5

        # Configuración
        self.max_steps = 100
        self.is_unlimited = False
        self.stop_on_food = True

    # --- GESTIÓN DE ESTADO ---
    def reset(self):
        self.agents = []
        self.food = []
        self.obstacles = []
        self.messages = []
        self.claims = {}
        self.step_count = 0
        self.is_running = False

    def update_dimensions(self, width: int, height: int):
        self.width = width
        self.height = height
        self.reset()

    def update_config(self, config: Dict[str, Any]):
        print(f" 🔧  Configuración actualizada: {config}")
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
            
            # APLICAR CONFIGURACIÓN DEL FRONTEND (RADIO DE VISIÓN)
            if config:
                if "color" in config: agent.color = config["color"]
                if "initialEnergy" in config: agent.energy = int(config["initialEnergy"])
                # AQUÍ SE APLICA EL RADIO DE VISIÓN QUE VIENE DEL SLIDER
                if "visionRadius" in config: 
                    agent.vision_radius = int(config["visionRadius"])
                else:
                    agent.vision_radius = 5 # Default si no viene config
            else:
                agent.vision_radius = 5

            # Inicializar memoria para exploradores
            agent.visited = set()
            agent.visited.add((x, y))
            
            self.agents.append(agent)
        except Exception as e:
            print(f" ❌  Error creando agente: {e}")

    def add_food(self, x: int, y: int, food_type: str = "food", config: Dict = None):
        if self._is_occupied(x, y): return
        self.food.append({
            "x": x, "y": y,
            "id": f"food_{len(self.food)}",
            "type": food_type,
            "value": 20
        })

    def add_obstacle(self, x: int, y: int, obs_type: str = "static", config: Dict = None):
        if self._is_occupied(x, y): return
        self.obstacles.append({
            "x": x, "y": y,
            "type": obs_type,
            "destructible": False,
            "cost": 5
        })

    def remove_at(self, x: int, y: int):
        self.agents = [a for a in self.agents if not (a.x == x and a.y == y)]
        self.food = [f for f in self.food if not (f['x'] == x and f['y'] == y)]
        self.obstacles = [o for o in self.obstacles if not (o['x'] == x and o['y'] == y)]

    def _is_occupied(self, x: int, y: int) -> bool:
        return any(a.x == x and a.y == y for a in self.agents) or \
               any(f['x'] == x and f['y'] == y for f in self.food) or \
               any(o['x'] == x and o['y'] == y for o in self.obstacles)

    # =========================================================================
    #  🧠 LÓGICA DE IA (CORREGIDA: VISIÓN LIMITADA + COOPERACIÓN REAL)
    # =========================================================================

    def _get_agent_decision(self, agent, world_state) -> Tuple[int, int]:
        agent_type = getattr(agent, "type", "reactive").lower()
        
        strategies = {
            "reactive": self._logic_reactive,
            "explorer": self._logic_explorer,
            "collector": self._logic_collector, # Alias para Planner
            "planner": self._logic_collector,
            "cooperative": self._logic_cooperative,
            "competitive": self._logic_competitive,
            "q_learning": self._logic_q_learning,
            "custom": self._logic_custom
        }
        
        logic = next((func for key, func in strategies.items() if key in agent_type), self._logic_reactive)
        return logic(agent, world_state)

    # --- HELPER: LO QUE VE EL AGENTE REALMENTE ---
    def _get_visible_food(self, agent):
        """Retorna SOLO la comida dentro del radio de visión."""
        visible = []
        vr = getattr(agent, "vision_radius", 3) # Si falla, usa 3 por defecto
        
        for f in self.food:
            # Distancia Manhattan
            dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
            if dist <= vr:
                visible.append(f)
        return visible

    # 1. REACTIVO: Solo ve adyacentes (Radio 1 implícito)
    def _logic_reactive(self, agent, ws):
        # Prioridad: Comer si está al lado
        for dx, dy in [(0, -1), (1, 0), (0, 1), (-1, 0)]:
            nx, ny = agent.x + dx, agent.y + dy
            if any(f['x'] == nx and f['y'] == ny for f in self.food):
                return dx, dy
        
        # Si no, mover random a casilla libre
        valid = []
        for dx, dy in [(0, -1), (1, 0), (0, 1), (-1, 0)]:
            nx, ny = agent.x + dx, agent.y + dy
            if 0 <= nx < self.width and 0 <= ny < self.height:
                if not self._is_occupied(nx, ny):
                    valid.append((dx, dy))
        
        return random.choice(valid) if valid else (0, 0)

    # 2. EXPLORADOR: Prioriza no visitados, respeta visión limitada
    def _logic_explorer(self, agent, ws):
        if not hasattr(agent, "visited"): agent.visited = set()
        agent.visited.add((agent.x, agent.y))

        # Solo puede decidir moverse a donde ve
        vr = getattr(agent, "vision_radius", 5)
        
        # Obtenemos celdas válidas ALREDEDOR (adyacentes)
        neighbors = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
        
        # Filtramos celdas nunca visitadas
        unvisited = [pos for pos in neighbors if pos not in agent.visited]
        
        # Si hay algo nuevo cerca, ir allá
        if unvisited:
            target = random.choice(unvisited)
            return target[0] - agent.x, target[1] - agent.y
            
        # Si estoy atascado en lo conocido, mover a cualquiera válido
        if neighbors:
            target = random.choice(neighbors)
            return target[0] - agent.x, target[1] - agent.y
            
        return 0, 0

    # 3. RECOLECTOR (Planner): Usa A* SOLO con comida VISIBLE
    def _logic_collector(self, agent, ws):
        visible_food = self._get_visible_food(agent)
        
        # SI NO VEO COMIDA -> ME COMPORTO COMO EXPLORADOR
        if not visible_food:
            return self._logic_explorer(agent, ws)
            
        # SI VEO COMIDA -> VOY A LA MÁS CERCANA
        target = self._find_nearest_from_list(agent, visible_food)
        
        if target:
            return self._calculate_path(agent, target, "astar")
            
        return 0, 0

    # 4. COOPERATIVO: Respeta reclamos en TIEMPO REAL
    def _logic_cooperative(self, agent, ws):
        # 1. ACTUALIZAR LISTA DE IGNORADOS CON MENSAJES DE ESTE TURNO
        # Leemos self.messages que han sido llenados por agentes anteriores en este mismo loop
        claimed_locations = set()
        for msg in self.messages:
            if msg['type'] == 'CLAIMED':
                claimed_locations.add(msg['pos'])

        # 2. OBTENER COMIDA VISIBLE
        visible_food = self._get_visible_food(agent)
        
        # 3. FILTRAR LA QUE YA ESTÁ RECLAMADA
        available_food = []
        for f in visible_food:
            pos = (f['x'], f['y'])
            # Si no está reclamada, O si la reclamé YO mismo (para no confundirme)
            claimant = self.claims.get(pos)
            if pos not in claimed_locations:
                 available_food.append(f)

        # 4. DECIDIR
        if not available_food:
            return self._logic_explorer(agent, ws)

        # Elegir la mejor disponible
        target_dict = self._find_nearest_dict_from_list(agent, available_food)
        target_pos = (target_dict['x'], target_dict['y'])

        # 5. RECLAMAR (Gritar al mundo)
        self.messages.append({
            "type": "CLAIMED",
            "sender_id": agent.id,
            "pos": target_pos
        })
        self.claims[target_pos] = agent.id # Registro persistente del turno

        return self._calculate_path(agent, target_pos, "astar")

    # 5. COMPETITIVO: Solo compite por lo que VE
    def _logic_competitive(self, agent, ws):
        visible_food = self._get_visible_food(agent)
        
        if not visible_food:
            # Patrullar agresivamente (movimiento rápido aleatorio)
            return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

        best_target = None
        best_score = -float('inf')

        for f in visible_food:
            my_dist = abs(agent.x - f['x']) + abs(agent.y - f['y'])
            
            # Ver si hay enemigos cerca DE ESA COMIDA (Solo si yo los veo también, idealmente)
            enemy_dist = float('inf')
            for other in self.agents:
                if other.id != agent.id:
                    # Trampa simple: Asumimos que intuye la posición del enemigo si está cerca
                    d = abs(other.x - f['x']) + abs(other.y - f['y'])
                    if d < enemy_dist: enemy_dist = d
            
            if enemy_dist <= my_dist:
                score = -100 # Perderé
            else:
                score = 100 - my_dist # Ganaré
            
            if score > best_score:
                best_score = score
                best_target = (f['x'], f['y'])

        if best_target:
            return self._calculate_path(agent, best_target, "astar")
            
        return random.choice([(0,1), (0,-1), (1,0), (-1,0)])

    # --- HELPERS ÚTILES ---
    def _find_nearest_from_list(self, agent, food_list):
        if not food_list: return None
        target = None
        min_dist = float('inf')
        for f in food_list:
            dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
            if dist < min_dist:
                min_dist = dist
                target = (f['x'], f['y'])
        return target

    def _find_nearest_dict_from_list(self, agent, food_list):
        if not food_list: return None
        target = None
        min_dist = float('inf')
        for f in food_list:
            dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
            if dist < min_dist:
                min_dist = dist
                target = f
        return target

    def _calculate_path(self, agent, target, strategy):
        start = (agent.x, agent.y)
        path = Pathfinding.a_star(start, target, self.width, self.height, self.obstacles)
        if path and len(path) > 1:
            return path[1][0] - agent.x, path[1][1] - agent.y
        elif path and len(path) == 1:
             return path[0][0] - agent.x, path[0][1] - agent.y
        return 0, 0

    # --- Q-LEARNING & CUSTOM (Sin cambios mayores) ---
    def _logic_q_learning(self, agent, ws):
        return self._logic_reactive(agent, ws) # Placeholder

    def _logic_custom(self, agent, ws):
        # Si tienes el executor activado, descomenta la lógica real
        # perception = self._build_perception(agent)
        # return execute_custom_agent_code(agent.custom_code, perception)
        return 0, 0

    # =========================================================================
    #  BUCLE PRINCIPAL (STEP)
    # =========================================================================
    def step(self):
        if self._check_stop_conditions(): return
        self.step_count += 1
        
        # Limpiamos el buzón al inicio del turno
        self.messages = [] 
        self.claims = {} 

        # Snapshot del mundo (opcional para visualización, no crítico para lógica interna)
        world_state = { "food": self.food, "obstacles": self.obstacles, "agents": self.agents }

        # Iteramos agentes
        for agent in self.agents:
            if agent.energy <= 0: continue
            
            # 1. DECISIÓN (Ahora usa la lógica corregida)
            dx, dy = self._get_agent_decision(agent, world_state)
            
            # 2. ACCIÓN
            self._apply_movement(agent, dx, dy)
            self._handle_interactions(agent)

        if self._check_stop_conditions(): return

    def _apply_movement(self, agent, dx, dy):
        new_x = max(0, min(self.width - 1, agent.x + dx))
        new_y = max(0, min(self.height - 1, agent.y + dy))

        # Obstáculos
        obstacle = next((o for o in self.obstacles if o['x'] == new_x and o['y'] == new_y), None)
        if obstacle:
            # Lógica simple de choque
            agent.energy -= 0.1
            return 

        # Colisión con Agentes
        if any(a.id != agent.id and a.x == new_x and a.y == new_y for a in self.agents):
            return 

        # Movimiento
        agent.x = new_x
        agent.y = new_y
        agent.energy -= 0.5
        agent.steps_taken += 1
        agent.path_history.append((new_x, new_y))

    def _handle_interactions(self, agent):
        # Comer
        for f in self.food[:]:
            if f['x'] == agent.x and f['y'] == agent.y:
                gain = f.get("value", 20)
                agent.energy = min(150, agent.energy + gain)
                self.food.remove(f)

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
            }
        }