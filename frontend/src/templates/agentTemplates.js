// src/templates/agentTemplates.js

const TEMPLATES = {
  // --- AGENTES ---
  reactive: {
    title: "Agente Reactivo",
    language: "python",
    description: "Toma decisiones basadas únicamente en su entorno inmediato (celdas vecinas) sin memoria del pasado.",
    code: `class ReactiveAgent(Agent):
    def decide(self, perception):
        # 1. PERCEIVE: Mira celdas adyacentes
        vecinos = perception.get_neighbors()
        
        # 2. DECIDE: Reglas simples
        # Regla A: Si hay comida al lado, tómala
        for celda in vecinos:
            if celda.has_food():
                return Move(to=celda)
        
        # Regla B: Si no, muévete al azar a un lugar libre
        libres = [c for c in vecinos if not c.is_blocked()]
        if libres:
            return Move(to=random.choice(libres))
            
        return Wait()`
  },
  
  explorer: { 
    title: "Agente Explorador (Memoria)",
    language: "python",
    description: "Mantiene un registro de las celdas visitadas para priorizar la exploración de terreno desconocido.",
    code: `class MemoryAgent(Agent):
    def __init__(self):
        self.visited = set() # STATE: Memoria

    def decide(self, perception):
        # 1. Actualizar memoria
        self.visited.add(self.current_pos)
        
        # 2. PERCEIVE
        vecinos = perception.get_neighbors()
        
        # 3. DECIDE
        # Prioridad: Celdas no visitadas
        no_visitados = [c for c in vecinos if c not in self.visited]
        
        if no_visitados:
            return Move(to=random.choice(no_visitados))
            
        # Si todo está visitado, retrocede (Backtracking simple)
        return Move(to=random.choice(vecinos))`
  },

  collector: { 
    title: "Agente Planificador (Búsqueda)",
    language: "python",
    description: "Utiliza algoritmos de búsqueda (BFS, A*, etc.) para encontrar el camino óptimo hacia un objetivo global.",
    code: `class PlannerAgent(Agent):
    def decide(self, world_state):
        # 1. Definir Objetivo
        target = world_state.find_nearest_food(self.pos)
        if not target: return Wait()
        
        # 2. Planificar Ruta (Algorithm: {{strategy}})
        # Calcula paso a paso cómo llegar
        path = algorithms.{{strategy}}(
            start=self.pos, 
            goal=target, 
            grid=world_state.grid
        )
        
        # 3. ACT: Ejecutar siguiente paso del plan
        next_step = path[0]
        return Move(to=next_step)`
  },

  cooperative: {
    title: "Agente Cooperativo",
    language: "python",
    description: "Comparte información con otros agentes. Si encuentra comida, avisa a sus compañeros.",
    code: `class CooperativeAgent(Agent):
    def decide(self, world_state):
        # 1. Revisar mensajes
        if self.inbox:
            msg = self.inbox.pop()
            if msg.type == 'FOUND_RESOURCE':
                self.target = msg.location
        
        # 2. Percibir entorno
        if self.sees_food():
            # COMUNICAR: Avisar a otros
            broadcast("FOUND_RESOURCE", self.pos)
            return Take()
            
        # 3. Moverse hacia objetivo compartido o explorar
        if self.target:
            return move_towards(self.target)
        else:
            return random_move()`
  },

  competitive: {
    title: "Agente Competitivo",
    language: "python",
    description: "Intenta bloquear a otros agentes y prioriza recursos en disputa.",
    code: `class CompetitiveAgent(Agent):
    def decide(self, world_state):
        # 1. Identificar rivales
        rivals = world_state.get_nearby_agents()
        
        # 2. Estrategia Agresiva
        for rival in rivals:
            if self.can_block(rival):
                return Block(rival.next_step)
        
        # 3. Priorizar recursos
        target = self.find_best_food()
        return move_towards(target)`
  },

  q_learning: {
    title: "Agente Q-Learning (RL)",
    language: "python",
    description: "Aprende a través de recompensas y castigos, actualizando una tabla de valores Q.",
    code: `class QLearningAgent(Agent):
    def update(self, state, action, reward, next_state):
        # Ecuación de Bellman
        old_q = self.q_table[state][action]
        max_future_q = max(self.q_table[next_state])
        
        # Q(s,a) = Q(s,a) + alpha * (R + gamma * maxQ(s',a') - Q(s,a))
        new_q = old_q + {{alpha}} * (reward + {{gamma}} * max_future_q - old_q)
        self.q_table[state][action] = new_q

    def decide(self, state):
        # Política Epsilon-Greedy (Exploración vs Explotación)
        if random.random() < {{epsilon}}:
            return random_action() # Explorar
        else:
            return argmax(self.q_table[state]) # Explotar`
  },

  // --- ALGORITMOS ---
  bfs: {
    title: "Algoritmo BFS",
    language: "python",
    description: "Búsqueda en anchura.",
    code: `def bfs(start, goal): ...`
  },
  astar: {
    title: "Algoritmo A*",
    language: "python",
    description: "Búsqueda heurística.",
    code: `def a_star(start, goal): ...`
  }
};

export const getTemplate = (type, params = {}) => {
  let template = TEMPLATES[type] || TEMPLATES['reactive'];
  let code = template.code;
  Object.keys(params).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    code = code.replace(regex, params[key]);
  });
  return { ...template, code };
};