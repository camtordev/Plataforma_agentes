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

    diagram: {
      title: "Diagrama: ciclo del agente",
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

    diagram: {
      title: "Diagrama: regla reactiva del limpiador",
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
  },

  // =========================
  // NIVEL 3
  // =========================
  {
    id: "lvl-3",
    level: 3,
    title: "Agente con memoria: evitar repetir celdas",
    summary:
      "Agrega estado interno (visitados) para reducir loops y explorar mejor.",
    estimatedMinutes: 20,

    diagram: {
      title: "Diagrama: actualización con memoria",
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
  },

  // =========================
  // NIVEL 4
  // =========================
  {
    id: "lvl-4",
    level: 4,
    title: "Planificación: BFS para encontrar caminos",
    summary:
      "Planifica una ruta hacia un objetivo en grid usando BFS (deque) y ejecuta un plan paso a paso.",
    estimatedMinutes: 26,

    diagram: {
      title: "Diagrama: agente basado en objetivos con BFS",
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
          "Usa una cola (deque) para explorar por capas.",
          "Si todas las acciones cuestan igual, BFS encuentra el camino más corto.",
          "Requiere visitados para evitar ciclos.",
        ],
      },
      {
        title: "Cómo resolver la práctica",
        bullets: [
          "Crea cola = deque([(x0,y0,[])]).",
          "Mientras cola: pop izquierda (popleft).",
          "Si llegaste: return camino.",
          "Si no: agrega vecinos válidos y no visitados.",
        ],
      },
      {
        title: "Errores comunes",
        bullets: [
          "Usar append/pop en vez de popleft (terminas haciendo DFS).",
          "Olvidar visitados y caer en loop.",
          "No validar límites/obstáculos antes de encolar.",
        ],
      },
    ],

    glossary: [
      { term: "Plan", def: "Lista de acciones para ejecutar en orden." },
      { term: "BFS", def: "Búsqueda en anchura; explora por capas." },
      { term: "deque", def: "Cola eficiente para popleft()." },
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
  },

  // =========================
  // NIVEL 5
  // =========================
  {
    id: "lvl-5",
    level: 5,
    title: "Búsqueda informada: A* con heurística Manhattan",
    summary:
      "Aprende A*: prioriza nodos por f=g+h y usa Manhattan como heurística en grid.",
    estimatedMinutes: 28,

    diagram: {
      title: "Diagrama: prioridad en A*",
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
        title: "Por qué A*",
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
  },

  // =========================
  // NIVEL 6
  // =========================
  {
    id: "lvl-6",
    level: 6,
    title: "Multi-agente: comunicación y cooperación",
    summary:
      "Implementa mensajes entre agentes para compartir información (p.ej. comida encontrada).",
    estimatedMinutes: 24,

    diagram: {
      title: "Diagrama: cooperación por mensajes",
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
  },

  // =========================
  // NIVEL 7
  // =========================
  {
    id: "lvl-7",
    level: 7,
    title: "Competencia: recursos limitados y desempate",
    summary:
      "Cuando varios agentes quieren el mismo recurso, aplicas reglas de desempate (distancia e id).",
    estimatedMinutes: 22,

    diagram: {
      title: "Diagrama: resolución de conflicto",
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
  },

  // =========================
  // NIVEL 8
  // =========================
  {
    id: "lvl-8",
    level: 8,
    title: "Aprendizaje por refuerzo: estructura de Q-Learning",
    summary:
      "Conecta recompensas con mejora de decisiones. Implementa estructura de Q-Table y ε-greedy.",
    estimatedMinutes: 30,

    diagram: {
      title: "Diagrama: loop de entrenamiento (RL)",
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
  },
]
