// frontend/src/content/tutorialsData.js

export const TUTORIAL_LEVELS = [
  // =========================
  // NIVEL 1
  // =========================
  {
    id: "lvl-1",
    level: 1,
    title: "Fundamentos: Arquitectura de Agentes Inteligentes",
    summary:
      "Aprende los conceptos fundamentales de agentes inteligentes: definición, estructura, ciclo de vida y cómo interactúan con su entorno a través del ciclo percibir → razonar → actuar.",
    estimatedMinutes: 18,

    learningObjectives: [
      "Comprender el ciclo básico de un agente: Percibir → Razonar → Actuar",
      "Implementar una función de decisión que retorne una acción válida",
      "Conocer las acciones válidas del entorno: UP, DOWN, LEFT, RIGHT, STAY",
      "Aplicar estructura correcta con parámetros y retorno apropiado",
      "Diferenciar entre observación (entrada) y acción (salida)",
    ],

    diagram: {
      title: "Diagrama: ciclo del agente",
      image: "/diagrams/flujoNivel1.jpeg",
      ascii: `
+-------------------+
|      ENTORNO       |
+---------+---------+
          |
          | observación (sensores)
          v
+---------+---------+
|       AGENTE       |
|  (estado/memoria)  |
+----+----------+---+
     | decisión  |
     v           |
  acción         |
(actuadores)     |
     |           |
     v           |
+----+-----------+--+
|      ENTORNO       |
+-------------------+
`,
    },

    theoryCards: [
      {
        title: "Qué es un agente (en simple)",
        bullets: [
          "Un agente es un sistema que toma decisiones para lograr un objetivo.",
          "Recibe información del entorno (observación), decide y ejecuta una acción.",
          "Puede tener memoria/estado interno (aunque en niveles iniciales será mínimo).",
        ],
      },
      {
        title: "Qué es el entorno",
        bullets: [
          "Es el ‘mundo’ donde ocurre la simulación: grilla, obstáculos, comida, suciedad, etc.",
          "Define reglas: límites del mapa, colisiones, recompensas, objetivos, final de episodio.",
        ],
      },
      {
        title: "Cómo conectar teoría con práctica",
        bullets: [
          "En la práctica, tu función/método debe devolver una acción válida.",
          "Aunque el código no se ejecute aún, aprenderás la estructura correcta del agente.",
          "Si tu agente no tiene lógica todavía, devolver una acción fija es válido.",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "No devolver nada (falta return).",
          "Devolver un tipo incorrecto (por ejemplo, un número en vez de un string).",
          "Confundir observación (datos) con acción (decisión).",
        ],
      },
    ],

    glossary: [
      { term: "Observación", def: "Información perceptual que el agente recibe del entorno en cada ciclo (posición, objetos cercanos, estado del mundo)." },
      { term: "Acción", def: "Operación que el agente ejecuta para modificar el entorno (UP, DOWN, LEFT, RIGHT, STAY, CLEAN, COLLECT)." },
      { term: "Política (π)", def: "Función que mapea estados/observaciones a acciones. Puede ser determinista π(s) o estocástica π(a|s)." },
      { term: "Episodio", def: "Secuencia completa de interacciones desde un estado inicial hasta un estado terminal (éxito, falla o límite de pasos)." },
      { term: "Agente Autónomo", def: "Sistema capaz de actuar sin supervisión humana constante, tomando decisiones basadas en sus percepciones." },
      { term: "Estado", def: "Configuración completa del sistema en un momento dado (posición de agentes, recursos, obstáculos, tiempo)." },
      { term: "Sensor", def: "Mecanismo mediante el cual el agente percibe aspectos del entorno." },
      { term: "Actuador", def: "Mecanismo mediante el cual el agente ejerce acciones sobre el entorno." },
    ],

    codeExampleTitle: "Ejemplo: Agente básico con estructura completa",
    codeExample: `class AgenteBasico:
    """Agente mínimo que implementa el ciclo percibir-razonar-actuar"""
    
    def __init__(self, id, x, y):
        """Inicializa el agente con su identificador y posición inicial"""
        self.id = id
        self.x = x
        self.y = y
        self.energy = 100
    
    def percibir(self, entorno):
        """Obtiene información relevante del entorno"""
        return {
            'posicion': (self.x, self.y),
            'energia': self.energy,
            'entorno': entorno
        }
    
    def decidir(self, observacion):
        """Razona y selecciona una acción basada en la observación"""
        # Por ahora: acción fija (se mejorará en niveles siguientes)
        return "STAY"
    
    def actuar(self, accion):
        """Ejecuta la acción seleccionada"""
        return accion
    
    def ciclo(self, entorno):
        """Ciclo completo: percibir → decidir → actuar"""
        obs = self.percibir(entorno)
        accion = self.decidir(obs)
        return self.actuar(accion)
`,

    activity: {
      title: "Actividad Práctica: Implementa tu primer agente",
      prompt:
        "Crea una función act(observation) que retorne una acción válida. Esta función representa la fase de 'decidir' en el ciclo del agente. Por ahora puede retornar una acción fija, pero en niveles posteriores implementarás lógica condicional.",
      starter: `# ============================================
# ACCIONES VÁLIDAS EN EL ENTORNO
# ============================================
# "UP"    - Mover hacia arriba (y-1)
# "DOWN"  - Mover hacia abajo (y+1)
# "LEFT"  - Mover hacia la izquierda (x-1)
# "RIGHT" - Mover hacia la derecha (x+1)
# "STAY"  - Permanecer en la posición actual

def act(observation):
    """
    Función de decisión del agente.
    
    Args:
        observation (dict): Datos del entorno visibles para el agente
        
    Returns:
        str: Una acción válida del conjunto {"UP", "DOWN", "LEFT", "RIGHT", "STAY"}
    """
    # TODO: Implementa la lógica de decisión
    # Por ahora, retorna una acción fija para validar la estructura
    
    return "STAY"
`,
      rules: {
        mustInclude: ["def act", "return"],
        mustIncludeAny: ['"up"', '"down"', '"left"', '"right"', '"stay"'],
      },
      tips: [
        "💡 La función debe retornar exactamente uno de los strings válidos: 'UP', 'DOWN', 'LEFT', 'RIGHT' o 'STAY'.",
        "💡 Aunque la lógica sea simple ahora, mantén buenas prácticas: nombres claros, comentarios útiles.",
        "💡 Piensa en observation como toda la información que el agente 've' del mundo.",
        "💡 En niveles posteriores, usarás condicionales (if/else) para tomar decisiones inteligentes basadas en observation.",
        "💡 Considera edge cases: ¿qué pasa si no hay una acción obvia? STAY es una opción válida.",
      ],
    },

    quiz: [
      {
        q: "¿Cuál describe mejor a un agente?",
        options: [
          "Una tabla de base de datos",
          "Un sistema que percibe, decide y actúa en un entorno",
          "Una UI con botones",
          "Un archivo estático",
        ],
        correct: 1,
        explanation: "Un agente recibe observaciones, decide y ejecuta acciones.",
      },
      {
        q: "¿Qué es una acción?",
        options: [
          "La información que ve el agente",
          "La decisión que ejecuta el agente",
          "Un obstáculo del mapa",
          "Un gráfico del dashboard",
        ],
        correct: 1,
        explanation: "Acción = lo que el agente hace (mover, limpiar, etc.).",
      },
      {
        q: "¿Qué es el entorno?",
        options: ["El mundo y reglas donde actúa el agente", "El teclado", "El token JWT", "El navegador"],
        correct: 0,
        explanation: "El entorno define reglas, estados válidos y dinámica.",
      },
      {
        q: "¿Qué es una política?",
        options: [
          "Una regla que decide acciones",
          "Un tipo de obstáculo",
          "Un archivo JSON",
          "Una librería de gráficos",
        ],
        correct: 0,
        explanation: "Política = mapeo observación/estado → acción.",
      },
    ],

    workspacePractice: {
      objective: "Familiarízate con el workspace y comprende cómo los agentes interactúan con el entorno. Aprenderás a colocar agentes, comida y obstáculos para crear tu primera simulación.",
      agentName: "Agente Reactivo",
      agentCode: `class ReactiveAgent(Agent):
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
            
        return Wait()`,
      explanation: `El Agente Reactivo toma decisiones basadas únicamente en lo que percibe en el momento presente, sin memoria del pasado.

En cada paso:
1. Observa las celdas vecinas (arriba, abajo, izquierda, derecha)
2. Si encuentra comida en alguna celda adyacente, se mueve hacia ella
3. Si no hay comida cerca, elige aleatoriamente una celda libre y se mueve allí
4. Si no puede moverse, se queda quieto

Este agente no planifica ni recuerda dónde ha estado. Simplemente reacciona a lo que ve en cada momento.`,
      instructions: [
        "Haz clic en 'Ir al Workspace' para abrir el entorno de simulación",
        "En la barra lateral izquierda, encontrarás los diferentes tipos de agentes disponibles",
        "Selecciona el 'Agente Reactivo' (primer agente en la lista)",
        "Haz clic en cualquier celda vacía del grid para colocar el agente",
        "Ahora selecciona 'Comida' en la barra lateral",
        "Coloca varias piezas de comida dispersas por el mapa",
        "Opcionalmente, selecciona 'Obstáculo' y coloca algunos para crear desafíos",
        "Presiona el botón 'Play' ▶️ en la parte superior para iniciar la simulación",
        "Observa cómo el agente se mueve hacia la comida cuando la detecta cerca, o se mueve aleatoriamente cuando no hay comida visible"
      ]
    },
  },

  // =========================
  // NIVEL 2
  // =========================
  {
    id: "lvl-2",
    level: 2,
    title: "Agentes Reactivos: Arquitectura Estímulo-Respuesta",
    summary:
      "Aprende a implementar agentes reactivos simples basados en reglas condicionadas. Desarrolla un robot limpiador que responde directamente a percepciones del entorno sin utilizar memoria o planificación.",
    estimatedMinutes: 20,

    learningObjectives: [
      "Implementar reglas condicionales simples usando if/else para tomar decisiones",
      "Responder a percepciones inmediatas sin usar memoria del pasado",
      "Manejar importaciones de módulos correctamente (import random)",
      "Implementar comportamiento estocástico con random.choice()",
      "Aplicar arquitectura reactiva: decisiones basadas únicamente en el estímulo presente",
    ],

    diagram: {
      title: "Diagrama: regla reactiva del limpiador",
      image: "/diagrams/flujoNivel2.jpeg",
      ascii: `
          +------------------+
          | percibir suciedad|
          +--------+---------+
                   |
                   v
        +----------+-----------+
        | ¿hay suciedad aquí?  |
        +-----+-----------+----+
              |           |
            Sí|           |No
              v           v
        +-----+----+  +---+-------------------+
        | LIMPIAR  |  | elegir movimiento     |
        | (acción) |  | aleatorio (4 dirs)    |
        +----------+  +-----------------------+
`,
    },

    theoryCards: [
      {
        title: "Qué es un agente reactivo",
        bullets: [
          "Toma decisiones solo con la percepción actual (sin memoria).",
          "Se implementa con reglas if/else simples.",
          "Funciona bien para tareas locales (como limpiar una celda).",
        ],
      },
      {
        title: "Regla del limpiador (coherente con la práctica)",
        bullets: [
          "Percepción: booleano “hay suciedad aquí”.",
          "Si True → acción 'limpiar'.",
          "Si False → acción de movimiento ('arriba/abajo/izquierda/derecha').",
        ],
      },
      {
        title: "Cómo resolver la práctica",
        bullets: [
          "Implementa un if percepcion: return 'limpiar'.",
          "Si no, retorna random.choice([...]).",
          "Asegúrate de importar random y de devolver un string.",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "Olvidar importar random.",
          "Usar random.choice sin lista.",
          "Devolver acción no contemplada por el entorno.",
        ],
      },
    ],

    glossary: [
      { term: "Reactivo", def: "Decide con lo que ve ahora (sin memoria)." },
      { term: "Estímulo–respuesta", def: "Regla: si ocurre X, entonces haz Y." },
    ],

    codeExampleTitle: "Ejemplo: decisión reactiva",
    codeExample: `import random

def decidir_y_actuar(percepcion):
    if percepcion:
        return "limpiar"
    return random.choice(["arriba", "abajo", "izquierda", "derecha"])
`,

    activity: {
      title: "Actividad: regla de limpieza",
      prompt:
        "Completa decidir_y_actuar(percepcion): si hay suciedad => 'limpiar', si no => movimiento aleatorio.",
      starter: `import random

def decidir_y_actuar(percepcion):
    # TODO: si percepcion es True => "limpiar"
    # TODO: si no => random.choice(["arriba","abajo","izquierda","derecha"])
    return ""
`,
      rules: {
        mustInclude: ["import random", "def decidir_y_actuar", "random.choice", "return"],
        mustIncludeAny: ['"limpiar"', '"arriba"', '"abajo"', '"izquierda"', '"derecha"'],
      },
      tips: [
        "El if debe estar antes del random.choice.",
        "Asegúrate de devolver un string siempre.",
      ],
    },

    quiz: [
      {
        q: "Un agente reactivo decide usando…",
        options: ["Memoria y planificación", "Solo la percepción actual", "Base de datos", "Internet"],
        correct: 1,
        explanation: "Reactivo = sin memoria, responde a lo percibido.",
      },
      {
        q: "Si el limpiador percibe suciedad, su acción correcta es…",
        options: ["arriba", "limpiar", "esperar", "reiniciar"],
        correct: 1,
        explanation: "La regla principal es: si hay suciedad → limpiar.",
      },
      {
        q: "¿Qué implementa random.choice en este nivel?",
        options: [
          "Una política de movimiento aleatorio",
          "Una memoria del entorno",
          "Un algoritmo de búsqueda",
          "Una recompensa",
        ],
        correct: 0,
        explanation: "Sirve para moverse cuando no hay suciedad.",
      },
      {
        q: "¿Cuál es un error típico en este nivel?",
        options: ["Usar if/else", "Olvidar return", "Devolver un string", "Importar random"],
        correct: 1,
        explanation: "Si no devuelves acción, el agente queda inválido.",
      },
    ],

    workspacePractice: {
      objective: "Experimenta con un agente reactivo y comprende cómo las reglas simples condición-acción pueden resolver tareas sin planificación compleja.",
      agentName: "Agente Reactivo",
      agentCode: `class ReactiveAgent(Agent):
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
            
        return Wait()`,
      explanation: `El agente reactivo usa reglas de tipo IF-THEN para decidir sus acciones:

Regla 1: IF (hay comida adyacente) THEN (moverse hacia ella)
Regla 2: IF (no hay comida cerca) THEN (movimiento aleatorio a celda libre)

Características clave:
- NO tiene memoria: no recuerda dónde ha estado
- NO planifica: solo reacciona al presente
- Respuesta inmediata: evalúa condiciones y actúa
- Comportamiento estocástico: usa randomización cuando no hay objetivo claro

Este tipo de agente es efectivo en entornos simples donde la información inmediata es suficiente para tomar buenas decisiones.`,
      instructions: [
        "Haz clic en 'Ir al Workspace'",
        "Selecciona 'Agente Reactivo' en la barra lateral",
        "Coloca el agente en el centro del grid",
        "Añade 5-6 piezas de comida distribuidas aleatoriamente",
        "Coloca algunos obstáculos para crear barreras",
        "Presiona Play ▶️ y observa cómo el agente se mueve",
        "Nota que cuando la comida está lejos, el agente se mueve aleatoriamente sin dirección clara",
        "Observa que puede quedar atrapado dando vueltas si la comida está detrás de obstáculos",
        "Prueba colocar comida muy cerca del agente y ve cómo reacciona inmediatamente",
        "Reflexiona: ¿Qué limitaciones tiene este enfoque reactivo puro?"
      ]
    },
  },

  // =========================
  // NIVEL 3
  // =========================
  {
    id: "lvl-3",
    level: 3,
    title: "Agentes con Estado Interno: Memoria y Exploración",
    summary:
      "Implementa agentes con memoria interna para evitar loops. Aprende a usar estructuras de datos (set) para rastrear posiciones visitadas y mejorar la exploración del entorno.",
    estimatedMinutes: 22,

    learningObjectives: [
      "Implementar estado interno manteniendo información entre decisiones",
      "Usar estructuras de datos eficientes: set() para búsquedas O(1)",
      "Trabajar con tuplas inmutables (x, y) en vez de listas [x, y]",
      "Evitar loops infinitos rastreando posiciones visitadas",
      "Actualizar estado dinámicamente conforme el agente interactúa con el entorno",
    ],

    diagram: {
      title: "Diagrama: actualización con memoria",
      image: "/diagrams/flujoNivel3.jpeg",
      ascii: `
+-------------------+
| percibir entorno   |
+---------+---------+
          |
          v
+-------------------+
| actualizar memoria |
| visitados.add(pos) |
+---------+---------+
          |
          v
+-----------------------------+
| decidir: mover a no-visitado|
| si no hay -> mover cualquiera|
+-------------+---------------+
              |
              v
          +---+---+
          | actuar |
          +-------+
`,
    },

    theoryCards: [
      {
        title: "Qué significa “memoria” aquí",
        bullets: [
          "Guardar información interna del mundo (por ahora: celdas visitadas).",
          "Estructura típica: set de tuplas (x,y).",
          "Objetivo: evitar ‘caminar en círculos’.",
        ],
      },
      {
        title: "Regla práctica con visitados",
        bullets: [
          "Genera opciones de movimientos válidos.",
          "Prioriza movimientos que lleven a celdas NO visitadas.",
          "Si todas ya fueron visitadas, elige cualquiera (fallback).",
        ],
      },
      {
        title: "Cómo resolver la práctica",
        bullets: [
          "En __init__, crea self.visitados = set([(x,y)]).",
          "Cada vez que te mueves, llama self.visitados.add((self.x,self.y)).",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "Guardar listas en vez de tuplas (no se pueden meter en set).",
          "Olvidar inicializar visitados con la posición inicial.",
          "No actualizar visitados luego de mover.",
        ],
      },
    ],

    glossary: [
      { term: "Estado interno", def: "Datos que el agente conserva entre pasos." },
      { term: "Visitados", def: "Conjunto de posiciones ya recorridas." },
    ],

    codeExampleTitle: "Ejemplo: set de visitados",
    codeExample: `class AgenteConMemoria:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.visitados = set([(x, y)])

    def marcar_visitado(self):
        self.visitados.add((self.x, self.y))
`,

    activity: {
      title: "Actividad: memoria de visitados",
      prompt:
        "Crea el set de visitados y un método que marque la posición actual como visitada.",
      starter: `class AgenteConMemoria:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        # TODO: set con la posición inicial
        self.visitados = None

    def marcar_visitado(self):
        # TODO: agrega (self.x, self.y) al set
        pass
`,
      rules: {
        mustInclude: ["self.visitados", "set(", "add(", "marcar_visitado"],
        mustIncludeAny: ["(self.x, self.y)", "(self.x,self.y)"],
      },
      tips: [
        "Un set guarda elementos únicos y permite búsquedas rápidas.",
        "Asegúrate de usar tuplas (x,y).",
      ],
    },

    quiz: [
      {
        q: "¿Cuál es el objetivo de usar visitados?",
        options: ["Hacer el código más largo", "Evitar loops y repetir celdas", "Eliminar el entorno", "Aumentar RAM"],
        correct: 1,
        explanation: "La memoria ayuda a explorar sin repetir innecesariamente.",
      },
      {
        q: "¿Por qué usamos tuplas (x,y) y no listas [x,y] en un set?",
        options: ["Porque tuplas son inmutables y hashables", "Porque listas son más rápidas", "Porque set no existe", "Porque Python lo prohíbe siempre"],
        correct: 0,
        explanation: "Listas no se pueden hashear, tuplas sí.",
      },
      {
        q: "¿Dónde se debe inicializar visitados?",
        options: ["En decidir()", "En __init__", "En el frontend", "En la base de datos"],
        correct: 1,
        explanation: "La memoria inicia cuando nace el agente.",
      },
      {
        q: "¿Qué pasa si no actualizas visitados al moverte?",
        options: ["Nada", "Tu memoria no refleja la ruta real", "El agente aprende RL", "Se ejecuta BFS"],
        correct: 1,
        explanation: "La memoria queda desfasada y pierde utilidad.",
      },
    ],

    workspacePractice: {
      objective: "Experimenta con un agente explorador que usa memoria interna para rastrear posiciones visitadas y mejorar su cobertura del entorno sin repetir caminos inútilmente.",
      agentName: "Agente Explorador (Memoria)",
      agentCode: `class MemoryAgent(Agent):
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
        return Move(to=random.choice(vecinos))`,
      explanation: `El Agente Explorador utiliza memoria interna (self.visited) para rastrear dónde ha estado:

1. Mantiene un set() de posiciones visitadas
2. En cada paso, añade su posición actual a la memoria
3. Prioriza moverse a celdas que NO ha visitado
4. Si todas las celdas vecinas ya fueron visitadas, hace backtracking (retrocede)

Ventajas sobre el agente reactivo:
- Cubre más área sistemáticamente
- Evita loops infinitos en el mismo lugar
- Explora de forma más eficiente

Este tipo de agente es ideal para tareas de exploración, mapeo y búsqueda exhaustiva.`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Explorador (Memoria)' en la barra lateral",
        "Coloca el agente en una esquina del grid",
        "NO agregues comida esta vez - vamos a observar solo la exploración",
        "Opcionalmente, crea un pequeño laberinto con obstáculos",
        "Presiona Play ▶️ y observa el patrón de movimiento",
        "Nota cómo el agente evita volver a celdas ya visitadas",
        "Observa que cubre sistemáticamente el área disponible",
        "Compara mentalmente con el agente reactivo: ¿Ves la diferencia en eficiencia?",
        "Prueba reiniciar y observar si el patrón es diferente (debido al random.choice)"
      ]
    },
  },

  // =========================
  // NIVEL 4
  // =========================
  {
    id: "lvl-4",
    level: 4,
    title: "Agentes Basados en Objetivos: Planificación con BFS",
    summary:
      "Implementa agentes que planifican secuencias de acciones para alcanzar objetivos. Aprende el algoritmo BFS (Breadth-First Search) para encontrar caminos óptimos en grids y ejecutar planes paso a paso.",
    estimatedMinutes: 28,

    learningObjectives: [
      "Implementar BFS (Breadth-First Search): algoritmo completo y óptimo",
      "Usar estructuras especializadas: deque para colas FIFO eficientes",
      "Diferenciar BFS de DFS: popleft() es FIFO, pop() es LIFO",
      "Planificar secuencias de acciones desde inicio hasta objetivo",
      "Garantizar optimalidad: BFS encuentra el camino más corto en grafos no ponderados",
      "Evitar ciclos usando conjuntos de visitados",
    ],

    diagram: {
      title: "Diagrama: agente basado en objetivos con BFS",
      image: "/diagrams/flujoNivel4.png",
      ascii: `
+------------------------+
| ¿tengo plan? (camino)  |
+----------+-------------+
           |
     No    |    Sí
      v    |     v
+-----+----+  +------------------+
| BFS/plan |  | tomar 1er paso   |
| con deque|  | del plan         |
+-----+----+  +--------+---------+
      |                |
      v                v
+------------------------------+
| actuar (mover) y actualizar  |
+------------------------------+
`,
    },

    theoryCards: [
      {
        title: "Qué es planificar",
        bullets: [
          "En vez de decidir movimiento al azar, calculas una secuencia de acciones hacia un objetivo.",
          "Eso se llama ‘plan’: lista de acciones (arriba, derecha, etc.).",
        ],
      },
      {
        title: "BFS (búsqueda en anchura) en un grid",
        bullets: [
          "Algoritmo de búsqueda no informada que explora el grafo por niveles o capas.",
          "Usa una cola FIFO (First-In-First-Out) implementada con collections.deque en Python.",
          "Propiedades: completo (encuentra solución si existe), óptimo en grafos no ponderados.",
          "Complejidad temporal: O(b^d) donde b=branching factor, d=profundidad de la solución.",
          "En grids 2D: garantiza el camino con menor número de pasos cuando todos tienen costo 1.",
        ],
      },
      {
        title: "Implementación de BFS en Grids",
        bullets: [
          "1. Inicializar: cola con estado inicial, conjunto de visitados, diccionario de padres (opcional).",
          "2. Loop principal: mientras cola no esté vacía, extraer con popleft().",
          "3. Verificar objetivo: si nodo actual es el objetivo, reconstruir y retornar camino.",
          "4. Expandir: generar vecinos válidos (4 u 8 direcciones), verificar límites y obstáculos.",
          "5. Filtrar: solo agregar vecinos no visitados para evitar ciclos.",
          "6. Encolar: agregar vecinos a la cola con append(), marcar como visitados.",
        ],
      },
      {
        title: "Patrones y Mejores Prácticas",
        bullets: [
          "✅ USAR: deque con popleft() para FIFO verdadero - O(1) vs O(n) de list.pop(0).",
          "✅ USAR: set para visitados - búsqueda O(1) vs O(n) de listas.",
          "✅ VALIDAR: límites del grid ANTES de agregar a la cola.",
          "✅ ESTRUCTURA: tupla (x, y, camino) para mantener estado y recorrido juntos.",
          "❌ EVITAR: usar list.pop(0) - convierte BFS en operación O(n).",
          "❌ EVITAR: olvidar marcar como visitado - causa loops infinitos.",
        ],
      },
    ],

    glossary: [
      { term: "Plan", def: "Secuencia ordenada de acciones calculada para transitar desde el estado actual hasta el objetivo." },
      { term: "BFS (Breadth-First Search)", def: "Algoritmo de búsqueda que explora el espacio de estados por niveles usando una cola FIFO." },
      { term: "deque", def: "Estructura de datos de doble cola (double-ended queue) con O(1) para operaciones en ambos extremos." },
      { term: "Completitud", def: "Propiedad de algoritmo que garantiza encontrar solución si existe." },
      { term: "Optimalidad", def: "Propiedad de algoritmo que garantiza encontrar la mejor solución según alguna métrica." },
      { term: "Frontera", def: "Conjunto de nodos generados pero aún no expandidos (la cola en BFS)." },
    ],

    codeExampleTitle: "Ejemplo: estructura BFS",
    codeExample: `from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    cola = deque([(x0, y0, [])])
    visitados = {(x0, y0)}

    while cola:
        x, y, camino = cola.popleft()
        if (x, y) == objetivo:
            return camino

        for dx, dy, accion in [(0,-1,"arriba"),(0,1,"abajo"),(-1,0,"izquierda"),(1,0,"derecha")]:
            nx, ny = x + dx, y + dy
            if entorno.es_valido(nx, ny) and (nx, ny) not in visitados and not entorno.hay_obstaculo(nx, ny):
                visitados.add((nx, ny))
                cola.append((nx, ny, camino + [accion]))

    return []
`,

    activity: {
      title: "Actividad: planificar_ruta con deque",
      prompt:
        "Completa planificar_ruta() siguiendo el patrón BFS (cola + visitados + vecinos).",
      starter: `from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    # TODO: objetivo None => []
    # TODO: cola = deque([(x0,y0,[])])
    # TODO: visitados = {(x0,y0)}
    # TODO: while cola: popleft()
    # TODO: si (x,y)==objetivo => return camino
    # TODO: explorar vecinos válidos/no visitados/no obstáculo
    return []
`,
      rules: {
        mustInclude: ["from collections import deque", "deque(", "visitados", "while", "popleft", "return"],
        mustIncludeAny: ['"arriba"', '"abajo"', '"izquierda"', '"derecha"'],
      },
      tips: [
        "BFS = cola FIFO (popleft).",
        "Vecinos en 4 direcciones.",
      ],
    },

    quiz: [
      {
        q: "BFS usa principalmente…",
        options: ["Pila (stack)", "Cola (queue/deque)", "Árbol binario", "Red neuronal"],
        correct: 1,
        explanation: "BFS se implementa con cola FIFO (deque).",
      },
      {
        q: "¿Qué ventaja tiene BFS en grids sin pesos?",
        options: ["Camino más corto", "Camino más largo", "No necesita objetivo", "Siempre es aleatorio"],
        correct: 0,
        explanation: "En grafos no ponderados, BFS encuentra el camino más corto.",
      },
      {
        q: "¿Por qué necesitamos visitados?",
        options: ["Para dibujar UI", "Para evitar ciclos y repetición", "Para ejecutar RL", "Para hacer más lento"],
        correct: 1,
        explanation: "Evita explorar infinitamente los mismos estados.",
      },
      {
        q: "Si usas pop() en vez de popleft(), tiendes a…",
        options: ["Hacer DFS", "Hacer BFS", "No buscar", "Optimizar"],
        correct: 0,
        explanation: "pop() sobre lista/stack se parece a DFS.",
      },
    ],

    workspacePractice: {
      objective: "Experimenta con un agente planificador que utiliza el algoritmo BFS para calcular el camino óptimo hacia objetivos y ejecutarlo paso a paso.",
      agentName: "Agente Planificador (Búsqueda)",
      agentCode: `class PlannerAgent(Agent):
    def decide(self, world_state):
        # 1. Definir Objetivo
        target = world_state.find_nearest_food(self.pos)
        if not target: return Wait()
        
        # 2. Planificar Ruta (Algorithm: bfs)
        # Calcula paso a paso cómo llegar
        path = algorithms.bfs(
            start=self.pos, 
            goal=target, 
            grid=world_state.grid
        )
        
        # 3. ACT: Ejecutar siguiente paso del plan
        next_step = path[0]
        return Move(to=next_step)`,
      explanation: `El Agente Planificador usa BFS (Breadth-First Search) para encontrar caminos óptimos:

1. Identifica el objetivo más cercano (comida)
2. Ejecuta BFS para calcular el camino completo desde su posición hasta el objetivo
3. Sigue el plan calculado paso a paso

BFS garantiza el camino más corto en grids sin pesos:
- Explora nivel por nivel (vecinos inmediatos primero)
- Usa una cola FIFO (First In, First Out)
- No repite estados ya visitados

Ventajas:
- Encuentra el camino óptimo
- Evita obstáculos inteligentemente
- No se distrae con movimientos aleatorios

Este agente es más inteligente que el explorador porque planifica hacia un objetivo específico.`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Planificador (Búsqueda)' en la barra lateral",
        "Coloca el agente en un extremo del grid",
        "Coloca comida en el extremo opuesto (muy lejos)",
        "Crea un laberinto con obstáculos entre el agente y la comida",
        "Presiona Play ▶️",
        "Observa cómo el agente calcula un camino y lo sigue directamente",
        "Nota que NO se mueve aleatoriamente - cada paso tiene propósito",
        "Observa cómo rodea los obstáculos de forma inteligente",
        "Compara con los agentes anteriores: este es mucho más eficiente",
        "Prueba crear diferentes laberintos y ve cómo el agente siempre encuentra el camino"
      ]
    },
  },

  // =========================
  // NIVEL 5
  // =========================
  {
    id: "lvl-5",
    level: 5,
    title: "Búsqueda Informada: A* con Heurística Manhattan",
    summary:
      "Optimiza la búsqueda de caminos usando A*, un algoritmo informado que utiliza heurísticas. Aprende a implementar la distancia Manhattan y la función de evaluación f=g+h para búsquedas más eficientes que BFS.",
    estimatedMinutes: 30,

    learningObjectives: [
      "Implementar A* (A-Star): algoritmo de búsqueda informada con heurísticas",
      "Calcular heurística Manhattan: |dx| + |dy| para grids con movimiento cardinal",
      "Aplicar función de evaluación f=g+h combinando costo acumulado y estimación restante",
      "Usar colas de prioridad con heapq para expandir nodos más prometedores primero",
      "Optimizar exploración reduciendo nodos expandidos comparado con BFS",
      "Garantizar admisibilidad: heurística no debe sobreestimar para mantener optimalidad",
    ],

    diagram: {
      title: "Diagrama: prioridad en A*",
      image: "/diagrams/flujoNivel5.jpeg",
      ascii: `
+----------------------+
| open_set (heap)      |
| elementos: (f,g,pos) |
+----------+-----------+
           |
           v
  extraer menor f
           |
           v
¿pos es objetivo?
   |        |
  Sí        No
   v        v
 return    expandir vecinos
 camino     calcular:
            g' = g + costo
            h' = manhattan
            f' = g' + h'
            push en heap
`,
    },

    theoryCards: [
      {
        title: "Búsqueda Informada vs No Informada",
        bullets: [
          "BFS puede expandir demasiados nodos.",
          "A* usa una heurística para buscar ‘hacia’ el objetivo.",
        ],
      },
      {
        title: "Definición de f=g+h",
        bullets: [
          "g(n): costo acumulado desde el inicio.",
          "h(n): estimación del costo restante (heurística).",
          "f(n)=g(n)+h(n): prioridad de exploración.",
        ],
      },
      {
        title: "Heurística Manhattan",
        bullets: [
          "h=|dx|+|dy| funciona para movimientos cardinales (sin diagonales).",
          "Si h no sobreestima, A* puede ser óptimo.",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "No usar heapq y terminar haciendo búsqueda no priorizada.",
          "Heurística incorrecta (sobreestimar).",
          "No llevar control de visitados/mejor costo por nodo.",
        ],
      },
    ],

    glossary: [
      { term: "A*", def: "Búsqueda con prioridad usando costo + heurística." },
      { term: "Heurística", def: "Estimación del costo restante al objetivo." },
      { term: "heapq", def: "Cola de prioridad en Python." },
    ],

    codeExampleTitle: "Ejemplo: Manhattan",
    codeExample: `def manhattan(a, b):
    return abs(a[0]-b[0]) + abs(a[1]-b[1])
`,

    activity: {
      title: "Actividad: base de A*",
      prompt:
        "Escribe manhattan() y la estructura base de A* con heapq (aunque no se ejecute, debe verse correcta).",
      starter: `import heapq

def manhattan(a, b):
    # TODO: |dx| + |dy|
    return 0

def astar(inicio, objetivo, entorno):
    # TODO: open_set heap: (f, g, pos, camino)
    # TODO: expandir vecinos y calcular g,h,f
    return []
`,
      rules: {
        mustInclude: ["import heapq", "def manhattan", "abs(", "def astar", "heapq"],
        mustIncludeAny: ["f", "g", "h"],
      },
      tips: [
        "Piensa en el heap como una cola que siempre te da el menor f.",
        "Manhattan se usa para h.",
      ],
    },

    quiz: [
      { q: "A* prioriza nodos por…", options: ["g-h", "g+h", "h-g", "g*h"], correct: 1, explanation: "La fórmula estándar es f=g+h." },
      { q: "Manhattan se calcula como…", options: ["sqrt(dx²+dy²)", "|dx|+|dy|", "dx*dy", "|dx|-|dy|"], correct: 1, explanation: "En grid cardinal, Manhattan es |dx|+|dy|." },
      { q: "heapq se usa para…", options: ["Pila", "Cola de prioridad", "Diccionario", "Regex"], correct: 1, explanation: "heapq implementa prioridad por el menor valor." },
      { q: "A* suele explorar menos que BFS porque…", options: ["No usa vecinos", "La heurística guía hacia el objetivo", "No necesita objetivo", "Siempre es aleatorio"], correct: 1, explanation: "La heurística reduce exploración innecesaria." },
    ],

    workspacePractice: {
      objective: "Compara el algoritmo A* con BFS observando cómo la heurística Manhattan hace que el agente explore menos nodos y encuentre caminos de forma más eficiente.",
      agentName: "Agente Planificador (Búsqueda)",
      agentCode: `class PlannerAgent(Agent):
    def decide(self, world_state):
        # 1. Definir Objetivo
        target = world_state.find_nearest_food(self.pos)
        if not target: return Wait()
        
        # 2. Planificar Ruta (Algorithm: astar)
        # Usa heurística para explorar menos
        path = algorithms.astar(
            start=self.pos, 
            goal=target, 
            grid=world_state.grid
        )
        
        # 3. ACT: Ejecutar siguiente paso del plan
        next_step = path[0]
        return Move(to=next_step)`,
      explanation: `El mismo agente planificador, pero usando A* en lugar de BFS:

Diferencias clave con BFS:
- A* usa una función de evaluación: f(n) = g(n) + h(n)
  * g(n) = costo real desde el inicio
  * h(n) = estimación heurística al objetivo (Manhattan)
- Explora primero los nodos más prometedores (menor f)
- Usa una cola de prioridad en lugar de cola FIFO

Heurística Manhattan:
- h(n) = |x_goal - x_actual| + |y_goal - y_actual|
- Admisible: nunca sobreestima el costo real
- Perfecta para grids con movimiento cardinal (sin diagonales)

Resultado:
- Encuentra el mismo camino óptimo que BFS
- Pero explora MENOS nodos en el proceso
- Más eficiente en mapas grandes`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Planificador (Búsqueda)' - el sistema usa A* internamente",
        "Coloca el agente en una esquina del grid",
        "Coloca comida en la esquina opuesta (máxima distancia)",
        "Crea un laberinto complejo con muchos obstáculos",
        "Presiona Play ▶️",
        "Observa el camino que toma - debería ser óptimo",
        "Mentalmente compara: BFS exploraría en todas direcciones uniformemente",
        "A* se enfoca más en la dirección del objetivo gracias a la heurística",
        "Prueba con diferentes configuraciones de laberintos",
        "Nota: La ventaja de A* es más evidente en mapas muy grandes"
      ]
    },
  },

  // =========================
  // NIVEL 6
  // =========================
  {
    id: "lvl-6",
    level: 6,
    title: "Sistemas Multi-Agente: Comunicación y Cooperación",
    summary:
      "Explora interacciones entre múltiples agentes. Implementa protocolos de comunicación para compartir información (ej: ubicación de recursos) y coordinar acciones hacia objetivos comunes.",
    estimatedMinutes: 26,

    learningObjectives: [
      "Implementar protocolos de comunicación para enviar y recibir mensajes entre agentes",
      "Estructurar mensajes correctamente con diccionarios: {de, tipo, contenido}",
      "Gestionar buzón de mensajes manteniendo lista de mensajes recibidos",
      "Iterar sobre múltiples destinatarios para enviar broadcast",
      "Filtrar y procesar información extrayendo mensajes relevantes por tipo",
      "Coordinar acciones compartiendo información para lograr objetivos comunes",
    ],

    diagram: {
      title: "Diagrama: cooperación por mensajes",
      image: "/diagrams/flujoNivel6.png",
      ascii: `
Agente A percibe comida
        |
        v
+--------------------------+
| enviar_mensaje(tipo, pos)|
+-------------+------------+
              |
              v
     Agente B recibe msg
              |
              v
+--------------------------+
| procesar_mensajes()      |
| decide objetivo compartido|
+-------------+------------+
              |
              v
         planificar/actuar
`,
    },

    theoryCards: [
      {
        title: "Qué es un sistema multi-agente",
        bullets: [
          "Varios agentes interactúan en el mismo entorno.",
          "Pueden cooperar (objetivo común) o competir (recursos escasos).",
        ],
      },
      {
        title: "Comunicación básica",
        bullets: [
          "Un mensaje mínimo: {de, tipo, contenido}.",
          "tipo puede ser 'comida_encontrada' y contenido una posición (x,y).",
          "La coordinación nace de compartir información útil.",
        ],
      },
      {
        title: "Cómo resolver la práctica",
        bullets: [
          "enviar_mensaje: recorrer destinatarios y llamar recibir_mensaje.",
          "recibir_mensaje: guardar dict en self.mensajes.",
          "procesar: filtrar por tipo y luego limpiar la bandeja.",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "No limpiar self.mensajes y procesar duplicado.",
          "Guardar strings sueltos en vez de dicts estructurados.",
          "No incluir remitente (de) y perder trazabilidad.",
        ],
      },
    ],

    glossary: [
      { term: "Mensaje", def: "Paquete de información para coordinación (tipo + contenido)." },
      { term: "Cooperación", def: "Agentes trabajan hacia un objetivo común." },
    ],

    codeExampleTitle: "Ejemplo: enviar y recibir mensajes",
    codeExample: `class AgenteCooperativo:
    def __init__(self, id):
        self.id = id
        self.mensajes = []

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        for agente in destinatarios:
            agente.recibir_mensaje(self.id, tipo, contenido)

    def recibir_mensaje(self, remitente, tipo, contenido):
        self.mensajes.append({"de": remitente, "tipo": tipo, "contenido": contenido})
`,

    activity: {
      title: "Actividad: mensajería mínima",
      prompt:
        "Implementa enviar_mensaje y recibir_mensaje usando self.mensajes (lista de dicts).",
      starter: `class AgenteCooperativo:
    def __init__(self, id):
        self.id = id
        self.mensajes = []

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        # TODO
        pass

    def recibir_mensaje(self, remitente, tipo, contenido):
        # TODO
        pass
`,
      rules: {
        mustInclude: ["self.mensajes", "append", "recibir_mensaje", "enviar_mensaje"],
        mustIncludeAny: ["tipo", "contenido", "de"],
      },
      tips: [
        "Piensa que destinatarios es una lista de agentes.",
        "contenido típicamente será (x,y) o un dict {x,y}.",
      ],
    },

    quiz: [
      { q: "Un sistema multi-agente implica…", options: ["Solo un agente", "Múltiples agentes que interactúan", "Solo una base de datos", "Solo UI"], correct: 1, explanation: "MAS = múltiples agentes en el mismo entorno." },
      { q: "Un mensaje mínimo debería incluir…", options: ["Solo color", "Remitente/tipo/contenido", "Solo reward", "Solo token"], correct: 1, explanation: "Estructura ayuda a coordinar y depurar." },
      { q: "Cooperación significa…", options: ["Competir", "Trabajar hacia un objetivo común", "No actuar", "Eliminar el entorno"], correct: 1, explanation: "Cooperación = objetivo compartido." },
      { q: "¿Qué error común rompe la cooperación?", options: ["Limpiar mensajes", "No estructurar mensajes", "Usar dicts", "Enviar remitente"], correct: 1, explanation: "Sin estructura, no puedes tomar decisiones consistentes." },
    ],

    workspacePractice: {
      objective: "Experimenta con múltiples agentes cooperativos que comparten información para lograr objetivos comunes mediante comunicación y coordinación.",
      agentName: "Agente Cooperativo",
      agentCode: `class CooperativeAgent(Agent):
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
            return random_move()`,
      explanation: `Los Agentes Cooperativos trabajan en equipo compartiendo información:

Mecanismos de cooperación:
1. **Inbox**: Buzón de mensajes donde reciben comunicaciones
2. **Broadcast**: Envían mensajes a todos los demás agentes
3. **Objetivos compartidos**: Pueden ir a recursos descubiertos por otros

Flujo de comunicación:
- Agente A encuentra comida → envía mensaje "FOUND_RESOURCE"
- Agente B recibe el mensaje → guarda la ubicación como objetivo
- Agente B se mueve hacia ese objetivo compartido

Ventajas:
- Cobertura más rápida del entorno (trabajo en equipo)
- Información compartida beneficia a todos
- Más eficiente que agentes independientes

Esto es fundamental en sistemas multi-agente donde la colaboración mejora el rendimiento global.`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Cooperativo' en la barra lateral",
        "Coloca 3-4 agentes cooperativos en diferentes posiciones",
        "Distribuye comida en varias áreas del mapa",
        "Presiona Play ▶️",
        "Observa cómo los agentes exploran en diferentes direcciones",
        "Cuando un agente encuentra comida, los demás deberían converger hacia esa área",
        "Nota cómo se comunican y coordinan sus movimientos",
        "Compara con tener múltiples agentes reactivos independientes",
        "Reflexiona: ¿Cómo mejora la cooperación la eficiencia del sistema?",
        "Prueba con diferentes cantidades de agentes (2, 5, 8) y observa diferencias"
      ]
    },
  },

  // =========================
  // NIVEL 7
  // =========================
  {
    id: "lvl-7",
    level: 7,
    title: "Competencia y Resolución de Conflictos",
    summary:
      "Maneja escenarios competitivos con recursos limitados. Implementa mecanismos de desempate y estrategias para maximizar utilidad individual en entornos multi-agente competitivos.",
    estimatedMinutes: 24,

    learningObjectives: [
      "Implementar reglas de desempate deterministas para resolver conflictos reproducibles",
      "Usar funciones de ordenamiento avanzado: min() con key=lambda personalizada",
      "Priorizar criterios múltiples: primera prioridad distancia, segunda prioridad ID",
      "Evitar comportamiento aleatorio garantizando mismos inputs → mismos outputs",
      "Manejar recursos limitados asignándolos de forma justa y predecible",
      "Facilitar debugging con sistemas deterministas más fáciles de testear",
    ],

    diagram: {
      title: "Diagrama: resolución de conflicto",
      image: "/diagrams/flujoNivel7.jpeg",
      ascii: `
Agentes eligen objetivo
         |
         v
¿hay conflicto (mismo objetivo)?
   |               |
  No              Sí
   v               v
actuar       aplicar desempate:
            1) menor distancia
            2) si empata, menor id
            -> ganador toma el recurso
`,
    },

    theoryCards: [
      {
        title: "Qué es competencia",
        bullets: [
          "Varios agentes compiten por recursos escasos (comida, energía, etc.).",
          "Sin reglas, el sistema puede volverse caótico (choques, duplicación).",
        ],
      },
      {
        title: "Regla de desempate simple (estable)",
        bullets: [
          "Gana el agente más cercano al recurso (menor distancia).",
          "Si empatan, gana el de menor id (determinismo).",
        ],
      },
      {
        title: "Cómo resolver la práctica",
        bullets: [
          "Usa min(candidatos, key=lambda t: (t[1], t[0])).",
          "candidatos = [(id, dist), ...].",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "Invertir el orden (id antes que distancia).",
          "No definir distancia y comparar cosas diferentes.",
          "Resolver conflictos de forma aleatoria (dificulta reproducibilidad).",
        ],
      },
    ],

    glossary: [
      { term: "Conflicto", def: "Dos o más agentes quieren el mismo recurso/acción." },
      { term: "Determinismo", def: "Misma entrada → misma decisión (útil en simulación)." },
    ],

    codeExampleTitle: "Ejemplo: ganador por distancia e id",
    codeExample: `def elegir_ganador(candidatos):
    # candidatos: [(id, dist), ...]
    return min(candidatos, key=lambda t: (t[1], t[0]))
`,

    activity: {
      title: "Actividad: elegir_ganador",
      prompt:
        "Implementa elegir_ganador(candidatos) usando min con key=lambda (dist, id).",
      starter: `def elegir_ganador(candidatos):
    # candidatos: lista de (id, dist)
    # TODO: devolver el (id, dist) ganador
    return None
`,
      rules: {
        mustInclude: ["min(", "key=lambda", "return"],
        mustIncludeAny: ["dist", "id"],
      },
      tips: [
        "Primero compara por dist, luego por id.",
        "Esto hace al sistema reproducible.",
      ],
    },

    quiz: [
      { q: "Competencia ocurre cuando…", options: ["No hay agentes", "Recursos son limitados", "Todo es cooperativo", "No hay objetivos"], correct: 1, explanation: "Compiten cuando hay escasez." },
      { q: "La regla de desempate propuesta es…", options: ["Mayor distancia", "Menor distancia, luego menor id", "Menor id siempre", "Aleatorio"], correct: 1, explanation: "Primero distancia, luego id." },
      { q: "¿Por qué conviene determinismo en simulación?", options: ["Para que sea más lenta", "Para reproducir resultados y depurar", "Para ocultar errores", "Para eliminar logs"], correct: 1, explanation: "Ayuda a replicar escenarios." },
      { q: "¿Qué función de Python es clave en la práctica?", options: ["sum()", "min() con key", "print()", "open()"], correct: 1, explanation: "min con key permite aplicar la regla." },
    ],

    workspacePractice: {
      objective: "Observa cómo múltiples agentes compiten por recursos limitados y aprende sobre estrategias competitivas y resolución de conflictos en sistemas multi-agente.",
      agentName: "Agente Competitivo",
      agentCode: `class CompetitiveAgent(Agent):
    def decide(self, world_state):
        # 1. Identificar rivales
        rivals = world_state.get_nearby_agents()
        
        # 2. Estrategia Agresiva
        for rival in rivals:
            if self.can_block(rival):
                return Block(rival.next_step)
        
        # 3. Priorizar recursos
        target = self.find_best_food()
        return move_towards(target)`,
      explanation: `Los Agentes Competitivos priorizan su propio beneficio sobre el colectivo:

Estrategias competitivas:
1. **Identificación de rivales**: Detecta otros agentes cercanos
2. **Bloqueo**: Puede intentar bloquear el camino de competidores
3. **Priorización**: Va primero a los recursos más valiosos o cercanos

Diferencias con cooperativos:
- NO comparten información
- Pueden obstaculizar a otros
- Maximizan recompensa individual, no colectiva

Escenarios de uso:
- Juegos competitivos (ajedrez, go, videojuegos)
- Mercados con recursos limitados
- Simulaciones de competencia económica

Desafíos:
- Equilibrio Nash: ¿cuándo dejar de competir?
- Evitar "tragedia de los comunes"
- Resolución de conflictos determinística vs aleatoria`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Competitivo' en la barra lateral",
        "Coloca 3-4 agentes competitivos en diferentes esquinas",
        "Coloca POCA comida en el centro (menos que agentes)",
        "Esto crea escasez y fuerza la competencia",
        "Presiona Play ▶️",
        "Observa cómo todos los agentes corren hacia los mismos recursos",
        "Nota que pueden bloquearse mutuamente o competir por la misma comida",
        "Compara con agentes cooperativos: aquí NO hay colaboración",
        "Prueba aumentar/disminuir la cantidad de comida y observa cambios",
        "Reflexiona: ¿Cuándo es mejor cooperar y cuándo competir?"
      ]
    },
  },

  // =========================
  // NIVEL 8
  // =========================
  {
    id: "lvl-8",
    level: 8,
    title: "Aprendizaje por Refuerzo: Q-Learning Básico",
    summary:
      "Introduce conceptos fundamentales de Reinforcement Learning. Implementa Q-Learning con tabla Q, epsilon-greedy exploration y la ecuación de Bellman para que agentes aprendan políticas óptimas mediante experiencia.",
    estimatedMinutes: 35,

    learningObjectives: [
      "Implementar Q-Learning básico: algoritmo de aprendizaje por refuerzo libre de modelo",
      "Mantener tabla Q usando diccionario para mapear (estado, acción) → valor",
      "Aplicar estrategia ε-greedy balanceando exploración (random) vs explotación (mejor)",
      "Entender ecuación de Bellman: Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') - Q(s,a)]",
      "Manejar estados no vistos inicializando valores Q en 0.0 por defecto",
      "Usar .get() con valores por defecto para robustez",
      "Aprender de experiencia mejorando política mediante interacción con el entorno",
    ],

    diagram: {
      title: "Diagrama: loop de entrenamiento (RL)",
      image: "/diagrams/flujoNivel8.jpeg",
      ascii: `
for episode in EPISODES:
    state = reset()
    done = False
    while not done:
        action = ε-greedy(Q, state)
        next_state, reward, done = step(action)
        Q[state,action] = Q + α*(reward + γ*max_a' Q[next_state,a'] - Q)
        state = next_state
`,
    },

    theoryCards: [
      {
        title: "Qué es aprender aquí",
        bullets: [
          "En vez de reglas fijas, el agente mejora con experiencia.",
          "Usa recompensas como señal: bueno/malo.",
        ],
      },
      {
        title: "Idea de Q(s,a)",
        bullets: [
          "Q(s,a) estima el valor esperado de tomar acción a en estado s.",
          "Se actualiza usando recompensa y el mejor valor futuro.",
        ],
      },
      {
        title: "Exploración vs explotación (ε-greedy)",
        bullets: [
          "Explorar: probar acciones nuevas (probabilidad ε).",
          "Explotar: elegir la mejor acción conocida (1-ε).",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "Nunca explorar (ε=0 desde el inicio) → te estancas.",
          "No manejar estados no vistos (Q debería devolver 0.0 por defecto).",
          "Confundir ‘estado’ con ‘observación’ en estructuras simples.",
        ],
      },
    ],

    glossary: [
      { term: "Recompensa", def: "Señal numérica que guía el aprendizaje." },
      { term: "Q-Table", def: "Tabla/dict que guarda Q(s,a)." },
      { term: "α", def: "Tasa de aprendizaje." },
      { term: "γ", def: "Descuento del futuro." },
      { term: "ε", def: "Probabilidad de explorar." },
    ],

    codeExampleTitle: "Ejemplo: Q-Table + ε-greedy",
    codeExample: `import random

ACTIONS = ["arriba", "abajo", "izquierda", "derecha"]
Q = {}  # (state, action) -> value

def get_q(state, action):
    return Q.get((state, action), 0.0)

def choose_action(state, eps=0.2):
    if random.random() < eps:
        return random.choice(ACTIONS)
    return max(ACTIONS, key=lambda a: get_q(state, a))
`,

    activity: {
      title: "Actividad: get_q + choose_action",
      prompt:
        "Implementa get_q con Q.get((state,action),0.0) y choose_action con ε-greedy y max por Q.",
      starter: `import random

ACTIONS = ["arriba", "abajo", "izquierda", "derecha"]
Q = {}

def get_q(state, action):
    # TODO: Q.get((state, action), 0.0)
    return 0.0

def choose_action(state, eps=0.2):
    # TODO: ε-greedy
    return "arriba"
`,
      rules: {
        mustInclude: ["Q = {}", "Q.get(", "random.random", "random.choice", "max(", "key=lambda"],
        mustIncludeAny: ["eps", "q"],
      },
      tips: [
        "Si no existe Q(state,action), el valor debe ser 0.0.",
        "Explorar primero, explotar después.",
      ],
    },

    quiz: [
      { q: "¿Qué representa Q(s,a)?", options: ["Color", "Valor esperado de tomar acción a en estado s", "Obstáculo", "Token"], correct: 1, explanation: "Q estima el retorno esperado." },
      { q: "ε en ε-greedy significa…", options: ["Probabilidad de explorar", "Probabilidad de terminar", "Probabilidad de crash", "Probabilidad de limpiar"], correct: 0, explanation: "ε controla exploración." },
      { q: "¿Por qué get_q usa valor por defecto 0.0?", options: ["Por estética", "Para manejar estados no vistos", "Para eliminar aprendizaje", "Para hacer más lento"], correct: 1, explanation: "Al inicio Q no tiene entradas para todos los pares." },
      { q: "Explotar significa…", options: ["Elegir acción aleatoria", "Elegir la mejor acción conocida", "Reiniciar episodio", "Borrar Q"], correct: 1, explanation: "Explotación = usar lo mejor que sabes." },
    ],

    workspacePractice: {
      objective: "Observa un agente que aprende por refuerzo (Q-Learning), mejorando su comportamiento a través de la experiencia mediante recompensas y castigos.",
      agentName: "Agente Q-Learning (RL)",
      agentCode: `class QLearningAgent(Agent):
    def update(self, state, action, reward, next_state):
        # Ecuación de Bellman
        old_q = self.q_table[state][action]
        max_future_q = max(self.q_table[next_state])
        
        # Q(s,a) = Q(s,a) + alpha * (R + gamma * maxQ(s',a') - Q(s,a))
        new_q = old_q + 0.1 * (reward + 0.9 * max_future_q - old_q)
        self.q_table[state][action] = new_q

    def decide(self, state):
        # Política Epsilon-Greedy (Exploración vs Explotación)
        if random.random() < 0.2:
            return random_action() # Explorar
        else:
            return argmax(self.q_table[state]) # Explotar`,
      explanation: `El Agente Q-Learning aprende la política óptima mediante prueba y error:

Componentes clave:
1. **Q-Table**: Tabla que mapea (estado, acción) → valor esperado
2. **Ecuación de Bellman**: Actualiza valores Q basado en recompensas
3. **Epsilon-Greedy**: Balancea exploración (probar cosas nuevas) vs explotación (usar lo mejor conocido)

Parámetros:
- **alpha (0.1)**: Tasa de aprendizaje - qué tan rápido aprende
- **gamma (0.9)**: Factor de descuento - cuánto valora recompensas futuras
- **epsilon (0.2)**: Probabilidad de explorar (20%)

Proceso de aprendizaje:
1. Agente toma acción
2. Recibe recompensa del entorno
3. Actualiza Q-table con la ecuación de Bellman
4. Repite miles de veces hasta converger

Resultado: Después de entrenar, el agente encuentra la estrategia óptima sin que nadie le diga qué hacer.`,
      instructions: [
        "Ve al Workspace",
        "Selecciona 'Agente Q-Learning (RL)' en la barra lateral",
        "Coloca el agente en el grid",
        "Distribuye comida de forma uniforme",
        "Presiona Play ▶️ y OBSERVA PACIENTEMENTE",
        "Al principio: el agente se mueve erráticamente (explorando)",
        "Con el tiempo: sus movimientos se vuelven más directos y eficientes",
        "Esto es APRENDIZAJE - mejora con la experiencia",
        "Déjalo correr varios minutos para ver la mejora",
        "Nota: A diferencia de los otros agentes, este NO tiene conocimiento previo",
        "Aprende la política óptima desde cero mediante prueba y error",
        "Reflexiona: Este es el fundamento de IA moderna (AlphaGo, GPT, etc.)"
      ]
    },
  },
]

