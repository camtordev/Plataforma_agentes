import random
import math
from typing import List, Dict, Any, Tuple
from .agents.factory import AgentFactory
from .algorithms.pathfinding import Pathfinding

class SimulationEngine:
    def __init__(self):
        self.width = 25
        self.height = 25
        self.agents = []    
        self.food = []      
        self.obstacles = [] 
        self.messages = []  
        self.claims = {}    
        self.is_running = False
        self.step_count = 0
        self.speed = 0.5
        self.max_steps = 100
        self.is_unlimited = False
        self.stop_on_food = True

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

    def load_state(self, state: Dict[str, Any]):
        """
        Hidrata el motor desde un snapshot de estado serializado.
        """
        if not state:
            return

        self.width = state.get("width", self.width)
        self.height = state.get("height", self.height)
        self.food = state.get("food", []) or []
        self.obstacles = state.get("obstacles", []) or []
        self.step_count = state.get("step", 0)
        self.is_running = state.get("isRunning", False)

        # Configuración opcional
        config = state.get("config") or state.get("simulationConfig")
        if config:
            self.update_config(config)

        # Recrear agentes
        self.agents = []
        for a in state.get("agents", []) or []:
            try:
                agent_type = a.get("type", "reactive")
                agent_id = a.get("id", f"agent_{len(self.agents)}")
                x = a.get("x", 0)
                y = a.get("y", 0)
                strategy = a.get("strategy", "bfs")
                
                # Intento robusto de recreación
                try:
                    agent = AgentFactory.create_agent(agent_type, agent_id, x, y, strategy=strategy)
                except TypeError:
                    agent = AgentFactory.create_agent(agent_type, agent_id, x, y)

                # Propiedades opcionales
                for attr in ["energy", "steps_taken", "vision_radius", "color"]:
                    if attr in a:
                        setattr(agent, attr, a[attr])
                
                if "path_history" in a:
                    agent.path_history = a["path_history"]
                
                # Restaurar código personalizado si existe
                if "custom_code" in a:
                    agent.custom_code = a["custom_code"]

                self.agents.append(agent)
            except Exception as e:
                print(f"⚠️  Error al recrear agente desde snapshot: {e}")

    def update_config(self, config: Dict[str, Any]):
        print(f" 🔧  Configuración actualizada: {config}")
        if "maxSteps" in config: self.max_steps = int(config["maxSteps"])
        if "isUnlimited" in config: self.is_unlimited = bool(config["isUnlimited"])
        if "stopOnFood" in config: self.stop_on_food = bool(config["stopOnFood"])
        if "speed" in config and float(config["speed"]) > 0: self.speed = 0.5 / float(config["speed"])

    # =========================================================
    # ADD_AGENT ROBUSTO (Maneja errores silenciosos)
    # =========================================================
    def add_agent(self, x: int, y: int, agent_type: str = "reactive", strategy: str = "bfs", config: Dict = None):
        # 1. Verificar si está ocupado
        if self._is_occupied(x, y): 
            print(f"⚠️ [Simulation] No se puede colocar agente: Casilla {x},{y} ocupada.")
            return

        try:
            new_id = f"agent_{len(self.agents)}"
            
            # --- INTENTO DE CREACIÓN ROBUSTO ---
            try:
                # Intentamos pasar la estrategia (Lo ideal)
                agent = AgentFactory.create_agent(agent_type, new_id, x, y, strategy=strategy)
            except TypeError:
                print("⚠️ [Simulation] El Factory no acepta 'strategy', probando sin ella...")
                # Si falla (ej: Factory antigua), probamos sin strategy
                agent = AgentFactory.create_agent(agent_type, new_id, x, y)
            except Exception as e:
                print(f"❌ [Simulation] Error FATAL en Factory: {e}")
                return
            
            # --- CONFIGURACIÓN EXTRA ---
            if config:
                if "color" in config and hasattr(agent, "color"): 
                    agent.color = config["color"]
                
                if "initialEnergy" in config: 
                    agent.energy = int(config["initialEnergy"])
                
                if "visionRadius" in config:
                    try:
                        agent.vision_radius = int(float(config["visionRadius"]))
                    except:
                        agent.vision_radius = 5
            else:
                agent.vision_radius = 5

            # Inicializar conjunto de visitados si no existe
            if not hasattr(agent, "visited"):
                agent.visited = set()
            agent.visited.add((x, y))
            
            # --- EXITO ---
            self.agents.append(agent)
            print(f"✅ [Simulation] Agente {new_id} ({agent_type}) creado en ({x}, {y})")
            
        except Exception as e:
            # ESTE ES EL PRINT QUE TE DIRÁ QUÉ PASA EN LOS LOGS
            print(f"❌ [Simulation] ERROR CRÍTICO creando agente: {e}")
            import traceback
            traceback.print_exc()

    def add_food(self, x: int, y: int, food_type: str = "food", config: Dict = None):
        if self._is_occupied(x, y): return
        self.food.append({
            "x": x, "y": y,
            "id": f"food_{len(self.food)}",
            "type": food_type,
            "value": 20
        })

    # ========================================================
    #  LEER CONFIGURACIÓN DEL OBSTÁCULO (Frontend)
    # ========================================================
    def add_obstacle(self, x: int, y: int, obs_type: str = "static", config: Dict = None):
        if self._is_occupied(x, y): return
        
        # Valores por defecto
        is_destructible = False
        destruction_cost = 20
        
        # Leemos la configuración que viene del modal
        if config:
            # Leemos 'isDestructible' (react) o 'destructible'
            is_destructible = config.get("isDestructible", config.get("destructible", False))
            try:
                destruction_cost = int(config.get("destructionCost", config.get("cost", 20)))
            except:
                destruction_cost = 20

        self.obstacles.append({
            "x": x, "y": y,
            "type": obs_type,
            "destructible": is_destructible,
            "cost": destruction_cost
        })

    def remove_at(self, x: int, y: int):
        self.agents = [a for a in self.agents if not (a.x == x and a.y == y)]
        self.food = [f for f in self.food if not (f['x'] == x and f['y'] == y)]
        self.obstacles = [o for o in self.obstacles if not (o['x'] == x and o['y'] == y)]

    # --- HELPERS DE VALIDACIÓN ---
    
    def _is_occupied(self, x: int, y: int) -> bool:
        return any(a.x == x and a.y == y for a in self.agents) or \
               any(f['x'] == x and f['y'] == y for f in self.food) or \
               any(o['x'] == x and o['y'] == y for o in self.obstacles)

    # PERMITIR "VER" CAMINO SI ES DESTRUCTIBLE
    def _is_blocked(self, x: int, y: int) -> bool:
        # 1. Revisar Obstáculos
        obs = next((o for o in self.obstacles if o['x'] == x and o['y'] == y), None)
        if obs:
            # Si el obstáculo es destructible, NO lo consideramos "bloqueado" para la IA.
            # Esto permite que el agente intente moverse hacia él y active la destrucción en _apply_movement
            if obs.get("destructible", False):
                return False 
            
            # Si es indestructible, sí bloquea
            return True

        # 2. Revisar otros Agentes
        if any(a.x == x and a.y == y for a in self.agents):
            return True
            
        return False

    # ========================================================
    # MOVER OBSTÁCULOS DINÁMICOS
    # ========================================================
    def _update_dynamic_obstacles(self):
        """Mueve aleatoriamente los obstáculos marcados como 'dynamic'"""
        for obs in self.obstacles:
            if obs.get("type") == "dynamic":
                # Intentamos movernos en una dirección aleatoria
                moves = [(0, 1), (0, -1), (1, 0), (-1, 0), (0, 0)] 
                dx, dy = random.choice(moves)
                nx, ny = obs['x'] + dx, obs['y'] + dy
                
                # Verificamos límites y colisiones (no pisar nada)
                if (0 <= nx < self.width and 0 <= ny < self.height and 
                    not self._is_occupied(nx, ny)):
                    obs['x'] = nx
                    obs['y'] = ny

    def step(self):
        if self._check_stop_conditions(): return
        self.step_count += 1
        self.messages = [] 
        self.claims = {} 

        # 1. Movemos obstáculos dinámicos
        self._update_dynamic_obstacles()

        world_state = { "food": self.food, "obstacles": self.obstacles, "agents": self.agents }

        for agent in self.agents:
            if agent.energy <= 0: continue
            dx, dy = self._get_agent_decision(agent, world_state)
            self._apply_movement(agent, dx, dy)
            self._handle_interactions(agent)

        if self._check_stop_conditions(): return

    # ========================================================
    # LÓGICA DE DESTRUCCIÓN
    # ========================================================
    def _apply_movement(self, agent, dx, dy):
        new_x = max(0, min(self.width - 1, agent.x + dx))
        new_y = max(0, min(self.height - 1, agent.y + dy))

        # Buscamos si hay un obstáculo en la nueva posición
        obstacle = next((o for o in self.obstacles if o['x'] == new_x and o['y'] == new_y), None)
        
        if obstacle:
            # ¿Es destructible?
            if obstacle.get("destructible", False):
                cost = obstacle.get("cost", 20)
                
                # Si el agente tiene energía suficiente, lo rompe
                if agent.energy > cost:
                    agent.energy -= cost
                    self.obstacles.remove(obstacle) # 💥 Eliminar obstáculo
                    print(f"💥 Agente {agent.id} rompió muro en ({new_x}, {new_y})")
                    # El agente se queda quieto este turno mientras rompe el muro
                    return 
            
            # Si no es destructible o falta energía, choque normal
            agent.energy -= 0.1
            return 

        # Si hay otro agente, choque simple
        if any(a.id != agent.id and a.x == new_x and a.y == new_y for a in self.agents):
            return 

        # Movimiento normal
        agent.x = new_x
        agent.y = new_y
        agent.energy -= 0.5
        agent.steps_taken += 1
        agent.path_history.append((new_x, new_y))

    def _handle_interactions(self, agent):
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

    # =========================================================================
    # LÓGICA DE IA
    # =========================================================================

    def _get_agent_decision(self, agent, world_state) -> Tuple[int, int]:
        try:
            agent_type = getattr(agent, "type", "reactive").lower()
            
            strategies = {
                "reactive": self._logic_reactive,
                "explorer": self._logic_explorer,
                "collector": self._logic_collector,
                "planner": self._logic_collector,
                "cooperative": self._logic_cooperative,
                "competitive": self._logic_competitive,
                "q_learning": self._logic_q_learning,
                "custom": self._logic_custom
            }
            
            logic = next((func for key, func in strategies.items() if key in agent_type), self._logic_reactive)
            return logic(agent, world_state)
            
        except Exception as e:
            print(f" ⚠️ Error en lógica del agente {agent.id}: {e}")
            return 0, 0

    def _get_visible_food(self, agent):
        visible = []
        try:
            vr = getattr(agent, "vision_radius", 5)
            if vr is None: vr = 5
        except:
            vr = 5
            
        for f in self.food:
            dist = abs(f['x'] - agent.x) + abs(f['y'] - agent.y)
            if dist <= vr:
                visible.append(f)
        return visible

    def _get_direction_towards(self, agent, tx, ty):
        dx = tx - agent.x
        dy = ty - agent.y
        if abs(dx) > abs(dy):
            step = (1 if dx > 0 else -1, 0)
        else:
            step = (0, 1 if dy > 0 else -1)
        nx, ny = agent.x + step[0], agent.y + step[1]
        
        # Usamos _is_blocked que ahora permite entrar si es destructible
        if not self._is_blocked(nx, ny):
            return step
            
        if step[0] != 0: 
            step = (0, 1 if dy > 0 else -1)
        else: 
            step = (1 if dx > 0 else -1, 0)
        nx, ny = agent.x + step[0], agent.y + step[1]
        
        if not self._is_blocked(nx, ny):
            return step
        return 0, 0

    # ... LÓGICAS DE AGENTES ...
    def _logic_reactive(self, agent, ws):
        visible = self._get_visible_food(agent)
        if visible:
            target = self._find_nearest_dict_from_list(agent, visible)
            if target: return self._get_direction_towards(agent, target['x'], target['y'])
        valid = []
        for dx, dy in [(0, -1), (1, 0), (0, 1), (-1, 0)]:
            nx, ny = agent.x + dx, agent.y + dy
            # Usamos _is_blocked arreglado
            if 0 <= nx < self.width and 0 <= ny < self.height and not self._is_blocked(nx, ny):
                valid.append((dx, dy))
        return random.choice(valid) if valid else (0, 0)

    def _logic_explorer(self, agent, ws):
        if not hasattr(agent, "visited"): agent.visited = set()
        agent.visited.add((agent.x, agent.y))

        # Prioridad: si ve comida, ir hacia la comida usando A* (o fallback directo)
        visible_food = self._get_visible_food(agent)
        if visible_food:
            target = self._find_nearest_dict_from_list(agent, visible_food)
            if target:
                move = self._calculate_path_safe(agent, (target['x'], target['y']))
                # Si A* no devuelve movimiento pero aún no estamos en la casilla, intentar moverse directamente
                if move == (0, 0) and (agent.x, agent.y) != (target['x'], target['y']):
                    return self._get_direction_towards(agent, target['x'], target['y'])
                return move

        # Comportamiento exploratorio por defecto (vecinos no visitados)
        neighbors = Pathfinding.get_neighbors(agent.x, agent.y, self.width, self.height, self.obstacles)
        unvisited = [pos for pos in neighbors if pos not in agent.visited]
        if unvisited: return self._target_to_move(agent, random.choice(unvisited))
        if neighbors: return self._target_to_move(agent, random.choice(neighbors))
        return 0, 0

    def _logic_collector(self, agent, ws):
        visible_food = self._get_visible_food(agent)
        if not visible_food: return self._logic_explorer(agent, ws)

        # Usamos la versión que devuelve el diccionario para acceder a coordenadas
        target_dict = self._find_nearest_dict_from_list(agent, visible_food)
        if target_dict:
            move = self._calculate_path_safe(agent, (target_dict['x'], target_dict['y']))
            # Fallback: si A* no devuelve movimiento pero aún no estamos en la casilla objetivo,
            # intentamos moverse directamente en la dirección del objetivo para evitar quedarse quieto.
            if move == (0, 0) and (agent.x, agent.y) != (target_dict['x'], target_dict['y']):
                return self._get_direction_towards(agent, target_dict['x'], target_dict['y'])
            return move
        return 0, 0

    def _logic_cooperative(self, agent, ws):
        claimed_locations = set()
        for msg in self.messages:
            if msg.get('type') == 'CLAIMED' and 'pos' in msg:
                claimed_locations.add(msg['pos'])
        visible_food = self._get_visible_food(agent)
        available_food = [f for f in visible_food if (f['x'], f['y']) not in claimed_locations]
        if not available_food: return self._logic_explorer(agent, ws)
        target_dict = self._find_nearest_dict_from_list(agent, available_food)
        if target_dict:
            target_pos = (target_dict['x'], target_dict['y'])
            self.messages.append({"type": "CLAIMED", "sender_id": agent.id, "pos": target_pos})
            move = self._calculate_path_safe(agent, target_pos)
            if move == (0, 0) and (agent.x, agent.y) != target_pos:
                 return self._get_direction_towards(agent, target_pos[0], target_pos[1])
            return move
        return 0, 0

    def _logic_competitive(self, agent, ws):
        visible_food = self._get_visible_food(agent)
        if not visible_food: return random.choice([(0,1), (0,-1), (1,0), (-1,0)])
        best_target = None
        best_score = -float('inf')
        for f in visible_food:
            my_dist = abs(agent.x - f['x']) + abs(agent.y - f['y'])
            enemy_dist = float('inf')
            for other in self.agents:
                if other.id != agent.id:
                    d = abs(other.x - f['x']) + abs(other.y - f['y'])
                    if d < enemy_dist: enemy_dist = d
            score = -100 if enemy_dist <= my_dist else (100 - my_dist)
            if score > best_score:
                best_score = score
                best_target = (f['x'], f['y'])
        if best_target:
            move = self._calculate_path_safe(agent, best_target)
            if move == (0, 0) and (agent.x, agent.y) != best_target:
                 return self._get_direction_towards(agent, best_target[0], best_target[1])
            return move
        return random.choice([(0,1), (0,-1), (1,0), (-1,0)])
    
    def _logic_q_learning(self, agent, ws):
        return self._logic_reactive(agent, ws)

    # ========================================
    # 2. LOGICA PERSONALIZADA (ACTIVADA) 
    # ========================================
    def _logic_custom(self, agent, ws):
        # Si el agente no tiene código, se queda quieto
        if not getattr(agent, "custom_code", None):
            return 0, 0
            
        # Construimos la "Percepción" (lo que ve el agente)
        visible_food = self._get_visible_food(agent)
        perception = {
            "x": agent.x,
            "y": agent.y,
            "energy": agent.energy,
            "width": self.width,
            "height": self.height,
            "nearby_food": [(f['x'], f['y']) for f in visible_food],
            "nearby_obstacles": [(o['x'], o['y']) for o in self.obstacles]
        }
        
        # IMPORTACIÓN SEGURA AQUÍ ADENTRO
        try:
            # Importamos aquí para que no falle al arrancar si la ruta está rara
            from .services.sandbox.executor import execute_custom_agent_code
            return execute_custom_agent_code(agent.custom_code, perception)
        except ImportError as e:
            print(f"❌ Error importando executor: {e}")
            return 0, 0
        except Exception as e:
            print(f"❌ Error ejecutando custom code: {e}")
            return 0, 0

    # --- HELPERS ---
    def _target_to_move(self, agent, target_pos):
        return target_pos[0] - agent.x, target_pos[1] - agent.y

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

    def _calculate_path_safe(self, agent, target):
        try:
            start = (agent.x, agent.y)
            path = Pathfinding.a_star(start, target, self.width, self.height, self.obstacles)
            if path and len(path) > 1:
                return path[1][0] - agent.x, path[1][1] - agent.y
            elif path and len(path) == 1:
                return path[0][0] - agent.x, path[0][1] - agent.y
        except Exception:
            pass
        return 0, 0