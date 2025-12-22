// src/templates/agentTemplates.js

const TEMPLATES = {
  // --- AGENTES ---
  reactive: {
    title: "Agente Reactivo",
    language: "python",
    description: "Toma decisiones basadas únicamente en su entorno inmediato (celdas vecinas) sin memoria del pasado.",
    code: `class ReactiveAgent(Agent):
    def decide(self, perception):
        # 1. PERCIBIR: Mira celdas adyacentes
        vecinos = perception.get_neighbors()

        # 2. DECIDIR: Reglas de supervivencia
        # Regla A: Si hay comida al lado, tómala (Prioridad Máxima)
        for celda in vecinos:
            if celda.has_food():
                return Move(to=celda)

        # Regla B: Si no, muévete al azar a un lugar libre
        libres = [c for c in vecinos if not c.is_blocked()]
        if libres:
            return Move(to=random.choice(libres))

        # Regla C: Si estoy encerrado, esperar
        return Wait()`
  },

  explorer: {
    title: "Agente Explorador (Memoria)",
    language: "python",
    description: "Mantiene un registro de las celdas visitadas para priorizar la exploración de terreno desconocido.",
    code: `class MemoryAgent(Agent):
    def __init__(self):
        self.visited = set() # STATE: Memoria de largo plazo

    def decide(self, perception):
        # 1. ACTUALIZAR MEMORIA
        self.visited.add(self.current_pos)

        # 2. CLASIFICAR OPCIONES
        vecinos = perception.get_neighbors()
        # Filtramos celdas que NUNCA hemos visitado
        nuevos = [v for v in vecinos if v not in self.visited]

        # 3. ESTRATEGIA: Curiosidad Pura
        # Siempre preferir ir a lo desconocido
        if nuevos:
            return Move(to=random.choice(nuevos))
        
        # Si ya conozco todo alrededor, retroceder (Backtracking)
        return Move(to=random.choice(vecinos))`
  },

  collector: { // Nota: Este es tu 'PlannerAgent'
    title: "Agente Recolector (Búsqueda)",
    language: "python",
    description: "Utiliza algoritmos de búsqueda (BFS, A*) para encontrar el camino óptimo hacia la comida más cercana.",
    code: `class CollectorAgent(Agent):
    def decide(self, world_state):
        # 1. Definir Objetivo (Comida más cercana)
        target = world_state.find_nearest_food(self.pos)
        if not target: return Wait()
        
        # 2. Planificar Ruta (Usando A* o BFS)
        # Calcula paso a paso cómo llegar
        path = algorithms.astar(
            start=self.pos, 
            goal=target, 
            grid=world_state.grid
        )
        
        # 3. ACTUAR: Ejecutar siguiente paso del plan
        if path:
            next_step = path[0]
            return Move(to=next_step)
        return Wait()`
  },

  cooperative: {
    title: "Agente Cooperativo",
    language: "python",
    description: "Coordina con otros para no repetir objetivos. Si alguien reclama una comida, este agente busca otra.",
    code: `class CooperativeAgent(Agent):
    def decide(self, world_state):
        # 1. ESCUCHAR A LOS DEMÁS
        # Si alguien gritó "CLAIMED" a una comida, la ignoro
        comida_ocupada = self.listen_messages("CLAIMED")

        # 2. BUSCAR COMIDA DISPONIBLE
        visible = world_state.find_food()
        targets_libres = [f for f in visible if f not in comida_ocupada]

        # 3. COORDINAR
        if targets_libres:
            target = targets_libres[0] # La más cercana
            # Aviso a los demás que esta es mía
            self.broadcast(msg="CLAIMED", data=target)
            return Move(to=target)

        return Explore()`
  },

  competitive: {
    title: "Agente Competitivo",
    language: "python",
    description: "Calcula el costo de oportunidad. Solo persigue comida si puede llegar antes que sus rivales.",
    code: `class CompetitiveAgent(Agent):
    def decide(self, world_state):
        mejor_opcion = None
        mejor_puntaje = -1000

        # Evaluar cada comida visible
        for comida in world_state.find_food():
            dist_mia = calculate_dist(self.pos, comida)
            dist_rival = calculate_dist(self.nearest_enemy, comida)

            # ESTRATEGIA: COSTO DE OPORTUNIDAD
            # Si el rival está más cerca, voy a perder -> Puntaje bajo
            if dist_rival <= dist_mia:
                puntaje = -100 
            else:
                # Si puedo ganar -> Puntaje alto
                puntaje = 100 - dist_mia

            if puntaje > mejor_puntaje:
                mejor_puntaje = puntaje
                mejor_opcion = comida

        if mejor_opcion:
            return Move(to=mejor_opcion)
        return Patrol()`
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

  custom: {
    title: "Agente Personalizado",
    language: "python",
    description: "Define tu propia lógica. Escribe el cuerpo de la función 'decide'. Debes devolver una tupla (dx, dy).",
    code: `# Escribe tu lógica aquí.
# Tienes acceso a:
# - 'perception': Un diccionario con datos del entorno.
# - 'random', 'math': Librerías estándar.

# Ejemplo de percepción:
# perception = {
#    "x": 5, "y": 5, "energy": 100,
#    "nearby_food": [(6,5), (5,6)],
#    "nearby_obstacles": [(4,4)]
# }

# TU CÓDIGO DEBE TERMINAR DEVOLVIENDO UNA TUPLA (dx, dy)

# --- Escribe tu código debajo de esta línea ---

if perception["nearby_food"]:
    # Ir hacia la primera comida que vea
    target = perception["nearby_food"][0]
    dx = target[0] - perception["x"]
    dy = target[1] - perception["y"]
    # Normalizar a 1 paso (simple)
    dx = max(-1, min(1, dx))
    dy = max(-1, min(1, dy))
    return (dx, dy)

# Si no hay comida, movimiento aleatorio
dx = random.choice([-1, 0, 1])
dy = random.choice([-1, 0, 1])
return (dx, dy)`
  },

  // --- ALGORITMOS (Opcional, si los muestras) ---
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

  return { 
      ...template, 
      code, 
      type: type 
  };
};