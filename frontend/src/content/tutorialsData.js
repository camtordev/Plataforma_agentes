// frontend/src/content/tutorialsData.js
// Contenido alineado con "ActividadTres.pdf" (Taller de Simulación de Sistemas)
// - Agente = autonomía + percepción + decisión + acción + objetivos/racionalidad :contentReference[oaicite:6]{index=6}
// - Arquitectura: Entorno → sensores → agente → actuadores → entorno (+ memoria/estado) :contentReference[oaicite:7]{index=7}
// - Tipos: reactivo, basado en modelo, basado en objetivos, utilidad, aprendizaje :contentReference[oaicite:8]{index=8}
// - Propiedades del entorno (observable, determinístico, secuencial, etc.) :contentReference[oaicite:9]{index=9}
// - Ejemplos: limpiador, recolector BFS con deque, multi-agente cooperativo con mensajes :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11}

export const TUTORIAL_LEVELS = [
  // =========================
  // NIVEL 1 - Conceptos básicos
  // =========================
  {
    id: "lvl-1",
    level: 1,
    title: "Conceptos básicos: ¿Qué es un agente?",
    summary:
      "Comprende autonomía, percepción, acción, objetivos y racionalidad; y la arquitectura Entorno→Sensores→Agente→Actuadores.",
    estimatedMinutes: 14,
    theoryCards: [
      {
        title: "Definición práctica de agente",
        bullets: [
          "Un agente opera con AUTONOMÍA, PERCEPCIÓN, ACCIÓN, OBJETIVOS y RACIONALIDAD :contentReference[oaicite:12]{index=12}.",
          "No es un “control central”: cada agente decide por sí mismo (descentralización).",
          "De interacciones simples pueden emerger comportamientos complejos (emergencia). :contentReference[oaicite:13]{index=13}",
        ],
      },
      {
        title: "Arquitectura de un agente",
        bullets: [
          "ENTORNO → [SENSORES] → AGENTE → [ACTUADORES] → ENTORNO :contentReference[oaicite:14]{index=14}.",
          "Incluye MEMORIA/ESTADO y una LÓGICA DE DECISIÓN que mapea percepciones→acciones :contentReference[oaicite:15]{index=15}.",
          "Ejemplo de acciones discretas: arriba/abajo/izquierda/derecha :contentReference[oaicite:16]{index=16}.",
        ],
      },
      {
        title: "Por qué importa en simulación",
        bullets: [
          "Permite modelar fenómenos: tráfico urbano, epidemias, economías, etc. :contentReference[oaicite:17]{index=17}",
          "Se recomienda incrementar complejidad gradualmente: reactivo → memoria → planificación → comunicación → aprendizaje :contentReference[oaicite:18]{index=18}.",
        ],
      },
    ],
    glossary: [
      { term: "Autonomía", def: "Opera sin intervención directa constante." },
      { term: "Percepción", def: "Recibe información del entorno mediante sensores." },
      { term: "Acción", def: "Modifica el entorno mediante actuadores." },
      { term: "Estado interno", def: "Memoria/creencias del agente sobre el mundo." },
      { term: "Emergencia", def: "Comportamientos complejos emergen de reglas simples." },
    ],
    codeExampleTitle: "Ejemplo mínimo: ciclo Percibir → Decidir → Actuar",
    codeExample: `class AgenteBase:
    def percibir(self, entorno):
        return {}

    def decidir(self, percepcion):
        return "arriba"

    def actuar(self, entorno, accion):
        pass

    def update(self, entorno):
        percepcion = self.percibir(entorno)
        accion = self.decidir(percepcion)
        self.actuar(entorno, accion)
`,
    activity: {
      title: "Actividad",
      prompt:
        "Completa el esqueleto de un agente con los métodos percibir(), decidir() y actuar().",
      starter: `class MiAgente:
    def percibir(self, entorno):
        # TODO: devolver alguna percepción (dict, bool, etc.)
        return {}

    def decidir(self, percepcion):
        # TODO: devolver una acción: "arriba", "abajo", "izquierda", "derecha"
        return "arriba"

    def actuar(self, entorno, accion):
        # TODO: aplicar acción al entorno (por ahora puede ser pass)
        pass
`,
      rules: {
        mustInclude: ["def percibir", "def decidir", "def actuar", "return"],
        mustIncludeAny: ['"arriba"', '"abajo"', '"izquierda"', '"derecha"'],
      },
      tips: [
        "La idea es entender el ciclo, no ejecutar Python aún.",
        "En niveles posteriores, tu percepción y decisión serán más ricas.",
      ],
    },
    quiz: [
      {
        q: "Según el documento, un agente se caracteriza por…",
        options: [
          "Solo por tener UI y una base de datos",
          "Autonomía, percepción, acción, objetivos y racionalidad",
          "Solo por ejecutar código más rápido",
          "Solo por tener comunicación en red",
        ],
        correct: 1,
        explanation:
          "El documento define al agente por autonomía, percepción, acción, objetivos y racionalidad :contentReference[oaicite:19]{index=19}.",
      },
      {
        q: "¿Qué describe mejor la arquitectura del agente?",
        options: [
          "Agente → Internet → Base de datos",
          "Entorno → Sensores → Agente → Actuadores → Entorno (+ memoria/estado)",
          "UI → Router → API",
          "CPU → RAM → Disco",
        ],
        correct: 1,
        explanation: "Arquitectura mostrada en el documento :contentReference[oaicite:20]{index=20}.",
      },
      {
        q: "¿Qué significa que no haya control central?",
        options: [
          "Que el sistema no tiene clases",
          "Que cada agente decide por sí mismo (descentralización)",
          "Que no existe entorno",
          "Que no hay acciones",
        ],
        correct: 1,
        explanation:
          "El documento enfatiza agentes independientes y descentralización :contentReference[oaicite:21]{index=21}.",
      },
      {
        q: "La ‘emergencia’ se refiere a…",
        options: [
          "Errores críticos del sistema",
          "Comportamientos complejos que surgen de interacciones simples",
          "Una acción del agente",
          "Un tipo de base de datos",
        ],
        correct: 1,
        explanation: "Se menciona que de interacciones simples emergen comportamientos complejos :contentReference[oaicite:22]{index=22}.",
      },
    ],
  },

  // =========================
  // NIVEL 2 - Agente reactivo (limpiador)
  // =========================
  {
    id: "lvl-2",
    level: 2,
    title: "Agente reactivo: Robot limpiador en un grid",
    summary:
      "Implementa estímulo–respuesta: si hay suciedad → limpiar; si no → moverse aleatorio. Basado en el ejemplo del documento.",
    estimatedMinutes: 18,
    theoryCards: [
      {
        title: "Agente reactivo simple",
        bullets: [
          "Responde directamente a percepciones, sin memoria :contentReference[oaicite:23]{index=23}.",
          "Ventaja: simple y rápido; desventaja: no planifica y puede caer en loops :contentReference[oaicite:24]{index=24}.",
        ],
      },
      {
        title: "Regla del limpiador",
        bullets: [
          "Si percibe suciedad en la celda actual → ejecutar acción 'limpiar'.",
          "Si no hay suciedad → moverse (arriba/abajo/izquierda/derecha) aleatoriamente.",
          "Esto refleja la lógica del ejemplo de robot limpiador :contentReference[oaicite:25]{index=25}.",
        ],
      },
      {
        title: "Entorno grid",
        bullets: [
          "El entorno define reglas del mundo (límites, suciedad, movimiento) :contentReference[oaicite:26]{index=26}.",
          "Diseñar el entorno es tan importante como diseñar el agente :contentReference[oaicite:27]{index=27}.",
        ],
      },
    ],
    glossary: [
      { term: "Reactivo", def: "Decide solo con la percepción actual, sin memoria." },
      { term: "Percepción local", def: "Información limitada (ej: suciedad en la celda actual)." },
    ],
    codeExampleTitle: "Ejemplo (basado en el documento): percibir suciedad y decidir",
    codeExample: `import random

class SimpleLimpiezaAgente:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.suciedad_limpiada = 0

    def percibir(self, entorno):
        return entorno.hay_suciedad(self.x, self.y)

    def decidir_y_actuar(self, percepcion):
        if percepcion:
            return "limpiar"
        return random.choice(["arriba", "abajo", "izquierda", "derecha"])
`,
    activity: {
      title: "Actividad",
      prompt:
        "Completa decidir_y_actuar(percepcion): si hay suciedad devuelve 'limpiar', si no devuelve un movimiento aleatorio.",
      starter: `import random

class SimpleLimpiezaAgente:
    def decidir_y_actuar(self, percepcion):
        # TODO:
        # - si percepcion es True => "limpiar"
        # - si no => random.choice(["arriba","abajo","izquierda","derecha"])
        return ""
`,
      rules: {
        mustInclude: ["import random", "def decidir_y_actuar", "random.choice", "return"],
        mustIncludeAny: ['"limpiar"'],
      },
      tips: [
        "Esta es la esencia del agente reactivo: condición → acción.",
        "Luego añadirás memoria para evitar loops.",
      ],
    },
    quiz: [
      {
        q: "Un agente reactivo simple se caracteriza por…",
        options: [
          "Tener planificación con búsqueda",
          "Responder a percepciones sin memoria",
          "Optimizar una función de utilidad siempre",
          "Aprender con recompensas necesariamente",
        ],
        correct: 1,
        explanation: "El documento define al reactivo como respuesta sin memoria :contentReference[oaicite:28]{index=28}.",
      },
      {
        q: "En el limpiador, si percibe suciedad en su celda, debe…",
        options: ["Moverse aleatorio", "Terminar el episodio", "Limpiar", "Enviar un mensaje"],
        correct: 2,
        explanation: "La regla central es: si hay suciedad → limpiar (estímulo–respuesta).",
      },
      {
        q: "Una desventaja típica del reactivo es…",
        options: ["Nunca se mueve", "No planifica y puede quedar en loops", "Siempre requiere red neuronal", "No tiene sensores"],
        correct: 1,
        explanation: "Se menciona explícitamente que puede quedar atrapado en loops :contentReference[oaicite:29]{index=29}.",
      },
      {
        q: "¿Qué rol cumple el entorno en esta simulación?",
        options: ["Es irrelevante", "Define reglas del mundo (suciedad, límites, movimiento)", "Solo renderiza UI", "Solo guarda usuarios"],
        correct: 1,
        explanation: "El entorno define reglas del mundo donde opera el agente :contentReference[oaicite:30]{index=30}.",
      },
    ],
  },

  // =========================
  // NIVEL 3 - Agente con memoria (modelo)
  // =========================
  {
    id: "lvl-3",
    level: 3,
    title: "Agente con memoria: recordar lugares visitados",
    summary:
      "Pasa de reactivo a basado en modelo: añade memoria (visitados) para no repetir celdas sin necesidad.",
    estimatedMinutes: 20,
    theoryCards: [
      {
        title: "Agente basado en modelo",
        bullets: [
          "Mantiene un modelo interno del mundo: memoria de lugares visitados y creencias :contentReference[oaicite:31]{index=31}.",
          "Ventaja: maneja información parcial; desventaja: más complejo :contentReference[oaicite:32]{index=32}.",
        ],
      },
      {
        title: "Memoria en grids",
        bullets: [
          "Estructura típica: set() de celdas visitadas: {(x,y), ...}.",
          "Regla práctica: evitar movimientos que te lleven a celdas ya visitadas (si hay alternativa).",
        ],
      },
      {
        title: "Ejercicio propuesto (del documento)",
        bullets: [
          "Modificar el agente limpiador para que recuerde lugares ya visitados :contentReference[oaicite:33]{index=33}.",
        ],
      },
    ],
    glossary: [
      { term: "Modelo interno", def: "Representación en memoria de lo que el agente cree del entorno." },
      { term: "Visitados", def: "Conjunto de posiciones ya recorridas." },
    ],
    codeExampleTitle: "Ejemplo: memoria de visitados",
    codeExample: `import random

MOVS = [("arriba", 0, -1), ("abajo", 0, 1), ("izquierda", -1, 0), ("derecha", 1, 0)]

class LimpiezaConMemoria:
    def __init__(self, x, y):
        self.x = x; self.y = y
        self.visitados = set([(x, y)])

    def decidir_movimiento(self, entorno):
        opciones = []
        for name, dx, dy in MOVS:
            nx, ny = self.x + dx, self.y + dy
            if entorno.es_valido(nx, ny) and (nx, ny) not in self.visitados:
                opciones.append(name)
        return random.choice(opciones) if opciones else random.choice([m[0] for m in MOVS])
`,
    activity: {
      title: "Actividad",
      prompt:
        "Agrega self.visitados = set() en __init__ y marca cada nueva posición como visitada.",
      starter: `class AgenteConMemoria:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        # TODO: crea un set() y guarda la posición inicial
        self.visitados = None

    def marcar_visitado(self):
        # TODO: añade (self.x, self.y) al set
        pass
`,
      rules: {
        mustInclude: ["self.visitados", "set(", "add(", "(", ")"],
        mustIncludeAny: ["visitado", "visitados"],
      },
      tips: [
        "Lo mínimo: set([(x,y)]) al inicio y luego .add((x,y)).",
        "Esta memoria es la base del agente basado en modelo :contentReference[oaicite:34]{index=34}.",
      ],
    },
    quiz: [
      {
        q: "Un agente basado en modelo se diferencia del reactivo porque…",
        options: [
          "No tiene acciones",
          "Mantiene memoria/modelo interno del mundo",
          "Solo funciona en entornos continuos",
          "No usa percepciones",
        ],
        correct: 1,
        explanation: "El documento menciona memoria de lugares visitados y modelo interno :contentReference[oaicite:35]{index=35}.",
      },
      {
        q: "¿Para qué sirve el set de visitados?",
        options: ["Para renderizar emojis", "Para evitar loops y repetir celdas", "Para aumentar la energía", "Para guardar usuarios"],
        correct: 1,
        explanation: "Evita que el agente recorra siempre las mismas celdas si hay alternativas.",
      },
      {
        q: "El documento propone explícitamente…",
        options: [
          "Eliminar la memoria del agente",
          "Modificar el limpiador para recordar lugares visitados",
          "Usar solo redes neuronales",
          "Convertir el grid en 3D",
        ],
        correct: 1,
        explanation: "Está en los ejercicios propuestos :contentReference[oaicite:36]{index=36}.",
      },
      {
        q: "¿Qué costo trae añadir memoria?",
        options: [
          "Ninguno",
          "Más complejidad y más uso de recursos",
          "Impide percibir",
          "Impide actuar",
        ],
        correct: 1,
        explanation: "El documento indica que es más complejo y requiere más memoria :contentReference[oaicite:37]{index=37}.",
      },
    ],
  },

  // =========================
  // NIVEL 4 - Búsqueda (BFS) para caminos
  // =========================
  {
    id: "lvl-4",
    level: 4,
    title: "Búsqueda: encontrar caminos (BFS con deque)",
    summary:
      "Aprende a planificar rutas en un grid usando BFS (cola deque), como el AgenteRecolector del documento.",
    estimatedMinutes: 26,
    theoryCards: [
      {
        title: "Agente basado en objetivos",
        bullets: [
          "Planifica una secuencia de acciones para alcanzar metas :contentReference[oaicite:38]{index=38}.",
          "En el documento: planificar ruta hacia comida visible y ejecutar el plan paso a paso :contentReference[oaicite:39]{index=39}.",
        ],
      },
      {
        title: "BFS en grid (idea)",
        bullets: [
          "BFS explora por capas: garantiza camino más corto en grids sin pesos.",
          "Usa una cola (deque) y un conjunto visitados para no repetir nodos :contentReference[oaicite:40]{index=40}.",
          "Explorar vecinos: arriba/abajo/izquierda/derecha :contentReference[oaicite:41]{index=41}.",
        ],
      },
      {
        title: "Evitar obstáculos y validar celdas",
        bullets: [
          "Se revisa que la celda sea válida y no sea obstáculo antes de encolar :contentReference[oaicite:42]{index=42}.",
        ],
      },
    ],
    glossary: [
      { term: "BFS", def: "Búsqueda en anchura; encuentra rutas cortas en grafos no ponderados." },
      { term: "deque", def: "Estructura de cola eficiente (collections.deque)." },
      { term: "Plan", def: "Lista de acciones que el agente ejecutará secuencialmente." },
    ],
    codeExampleTitle: "Ejemplo (documento): planificar_ruta con deque",
    codeExample: `from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    if objetivo is None:
        return []

    cola = deque([(x0, y0, [])])
    visitados = {(x0, y0)}

    while cola:
        x, y, camino = cola.popleft()

        if (x, y) == objetivo:
            return camino

        for dx, dy, direccion in [(0, -1, "arriba"), (0, 1, "abajo"),
                                  (-1, 0, "izquierda"), (1, 0, "derecha")]:
            nx, ny = x + dx, y + dy
            if entorno.es_valido(nx, ny) and (nx, ny) not in visitados and not entorno.hay_obstaculo(nx, ny):
                visitados.add((nx, ny))
                cola.append((nx, ny, camino + [direccion]))

    return []
`,
    activity: {
      title: "Actividad",
      prompt:
        "Completa la función planificar_ruta() usando deque, visitados, y la exploración de vecinos (arriba/abajo/izquierda/derecha).",
      starter: `from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    # TODO: si objetivo es None => []
    # TODO: cola = deque([(x0,y0,[])])
    # TODO: visitados = {(x0,y0)}
    # TODO: while cola: popleft()
    # TODO: si llegaste => return camino
    # TODO: explorar 4 vecinos y encolar si es válido/no visitado/no obstáculo
    return []
`,
      rules: {
        mustInclude: ["from collections import deque", "deque(", "visitados", "while", "popleft", "for dx", "return"],
        mustIncludeAny: ['"arriba"', '"abajo"', '"izquierda"', '"derecha"'],
      },
      tips: [
        "BFS es perfecto si todas las acciones cuestan igual.",
        "El patrón cola+visitados aparece tal cual en el documento :contentReference[oaicite:43]{index=43}.",
      ],
    },
    quiz: [
      {
        q: "¿Qué estructura se usa típicamente para BFS según el ejemplo del documento?",
        options: ["stack()", "deque()", "heap()", "dict()"],
        correct: 1,
        explanation: "El ejemplo usa collections.deque :contentReference[oaicite:44]{index=44}.",
      },
      {
        q: "¿Qué garantiza BFS en un grid sin pesos?",
        options: ["El camino más caro", "El camino más corto", "El camino aleatorio", "No garantiza nada"],
        correct: 1,
        explanation: "BFS encuentra la ruta más corta en grafos no ponderados.",
      },
      {
        q: "¿Por qué se usa un conjunto visitados?",
        options: ["Para dibujar el mapa", "Para no repetir celdas/estados", "Para aumentar la energía", "Para elegir heurística"],
        correct: 1,
        explanation: "Evita ciclos y duplicación de trabajo :contentReference[oaicite:45]{index=45}.",
      },
      {
        q: "Antes de encolar un vecino, el ejemplo verifica…",
        options: [
          "Que sea válido, no visitado y no obstáculo",
          "Que tenga comida siempre",
          "Que sea diagonal",
          "Que sea continuo",
        ],
        correct: 0,
        explanation: "Se validan celda y obstáculos antes de encolar :contentReference[oaicite:46]{index=46}.",
      },
    ],
  },

  // =========================
  // NIVEL 5 - A* heurístico
  // =========================
  {
    id: "lvl-5",
    level: 5,
    title: "A* heurístico: búsqueda informada (Manhattan)",
    summary:
      "Mejora BFS usando A*: f(n)=g(n)+h(n), con h=distancia Manhattan en grid.",
    estimatedMinutes: 28,
    theoryCards: [
      {
        title: "De BFS a A*",
        bullets: [
          "BFS explora por capas (bueno, pero puede expandir muchos nodos).",
          "A* usa una heurística para priorizar nodos prometedores (búsqueda informada).",
        ],
      },
      {
        title: "Heurística Manhattan en grid",
        bullets: [
          "h(n)=|dx|+|dy|: apropiada para movimientos arriba/abajo/izquierda/derecha.",
          "Si h no sobreestima, A* encuentra rutas óptimas.",
        ],
      },
      {
        title: "Conexión con agentes basados en objetivos",
        bullets: [
          "Un agente basado en objetivos planifica rutas y ejecuta el plan :contentReference[oaicite:47]{index=47}.",
          "A* es una forma más eficiente de planificar que BFS en mapas grandes.",
        ],
      },
    ],
    glossary: [
      { term: "A*", def: "Algoritmo de búsqueda informada que usa costo acumulado + heurística." },
      { term: "g(n)", def: "Costo desde el inicio hasta el nodo n." },
      { term: "h(n)", def: "Estimación del costo desde n hasta el objetivo (heurística)." },
      { term: "f(n)", def: "Prioridad total: f=g+h." },
    ],
    codeExampleTitle: "Ejemplo: heurística Manhattan",
    codeExample: `def manhattan(a, b):
    return abs(a[0]-b[0]) + abs(a[1]-b[1])
`,
    activity: {
      title: "Actividad",
      prompt:
        "Escribe una función manhattan() y una estructura base de A* usando una cola de prioridad (heapq).",
      starter: `import heapq

def manhattan(a, b):
    # TODO: |dx| + |dy|
    return 0

def astar(inicio, objetivo, entorno):
    # TODO: open_set como heap [(f, g, (x,y), camino)]
    # TODO: usar manhattan para h
    # TODO: expandir vecinos como en BFS
    return []
`,
      rules: {
        mustInclude: ["import heapq", "def manhattan", "abs(", "def astar", "heapq"],
        mustIncludeAny: ["f", "g", "h"],
      },
      tips: [
        "No ejecutamos Python aún: validamos estructura y conceptos.",
        "A* y BFS comparten la exploración de vecinos, cambia la prioridad.",
      ],
    },
    quiz: [
      {
        q: "¿Cuál es la fórmula típica de A*?",
        options: ["f=g-h", "f=g+h", "f=h/g", "f=g* h"],
        correct: 1,
        explanation: "A* prioriza por f(n)=g(n)+h(n).",
      },
      {
        q: "En un grid con movimientos cardinales, una heurística estándar es…",
        options: ["Euclidiana siempre", "Manhattan |dx|+|dy|", "Coseno", "Random"],
        correct: 1,
        explanation: "Manhattan es adecuada para arriba/abajo/izquierda/derecha.",
      },
      {
        q: "Comparado con BFS, A* suele…",
        options: ["Explorar más nodos", "Explorar menos nodos guiado por heurística", "No usar vecinos", "No necesita objetivo"],
        correct: 1,
        explanation: "La heurística guía la exploración hacia el objetivo.",
      },
      {
        q: "¿Qué rol cumple la planificación en un agente basado en objetivos?",
        options: ["Ninguno", "Calcular una secuencia de acciones hacia la meta", "Solo moverse aleatorio", "Solo comunicar"],
        correct: 1,
        explanation: "Planifica secuencias de acciones para alcanzar metas :contentReference[oaicite:48]{index=48}.",
      },
    ],
  },

  // =========================
  // NIVEL 6 - Multi-agente cooperativo (comunicación)
  // =========================
  {
    id: "lvl-6",
    level: 6,
    title: "Multi-agente cooperativo: comunicación y coordinación",
    summary:
      "Múltiples agentes cooperan compartiendo información de comida encontrada mediante mensajes.",
    estimatedMinutes: 24,
    theoryCards: [
      {
        title: "Sistemas Multi-Agente (MAS)",
        bullets: [
          "Cuando múltiples agentes interactúan puede haber cooperación/competencia/coexistencia :contentReference[oaicite:49]{index=49}.",
          "La comunicación permite coordinación distribuida :contentReference[oaicite:50]{index=50}.",
        ],
      },
      {
        title: "Patrón del ejemplo cooperativo",
        bullets: [
          "Cada agente percibe comida cercana y comparte posiciones con otros.",
          "Recibe mensajes y los procesa para decidir su objetivo.",
          "Esto aparece en el ejemplo del documento (enviar/recibir/procesar mensajes) :contentReference[oaicite:51]{index=51}.",
        ],
      },
      {
        title: "Beneficio de cooperar",
        bullets: [
          "Reduce trabajo duplicado.",
          "Mejora cobertura del mapa y velocidad de recolección.",
        ],
      },
    ],
    glossary: [
      { term: "Cooperación", def: "Agentes trabajan hacia un objetivo común." },
      { term: "Mensaje", def: "Unidad de comunicación (tipo + contenido + remitente)." },
      { term: "Coordinación distribuida", def: "No hay control central, se coordinan entre sí." },
    ],
    codeExampleTitle: "Ejemplo (documento): enviar y recibir mensajes",
    codeExample: `class AgenteCooperativo:
    def __init__(self, id):
        self.id = id
        self.mensajes = []

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        for agente in destinatarios:
            agente.recibir_mensaje(self.id, tipo, contenido)

    def recibir_mensaje(self, remitente, tipo, contenido):
        self.mensajes.append({"de": remitente, "tipo": tipo, "contenido": contenido})

    def procesar_mensajes(self):
        comida_reportada = []
        for msg in self.mensajes:
            if msg["tipo"] == "comida_encontrada":
                comida_reportada.append(msg["contenido"])
        self.mensajes.clear()
        return comida_reportada
`,
    activity: {
      title: "Actividad",
      prompt:
        "Implementa enviar_mensaje() y recibir_mensaje() usando una lista self.mensajes con dicts {de,tipo,contenido}.",
      starter: `class AgenteCooperativo:
    def __init__(self, id):
        self.id = id
        self.mensajes = []

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        # TODO: llamar a agente.recibir_mensaje(...)
        pass

    def recibir_mensaje(self, remitente, tipo, contenido):
        # TODO: append dict con {de,tipo,contenido}
        pass
`,
      rules: {
        mustInclude: ["self.mensajes", "append", "recibir_mensaje", "enviar_mensaje"],
        mustIncludeAny: ["contenido", "tipo", "de"],
      },
      tips: [
        "El contenido suele ser una posición (x,y) de comida encontrada.",
        "Esto implementa comunicación como se describe en MAS :contentReference[oaicite:52]{index=52}.",
      ],
    },
    quiz: [
      {
        q: "¿Qué describe un sistema multi-agente (MAS)?",
        options: ["Un solo agente", "Múltiples agentes que interactúan", "Un servidor web", "Una base de datos"],
        correct: 1,
        explanation: "MAS implica múltiples agentes interactuando :contentReference[oaicite:53]{index=53}.",
      },
      {
        q: "La cooperación significa…",
        options: ["Agentes compiten por recursos", "Agentes trabajan hacia un objetivo común", "Agentes se apagan", "No hay entorno"],
        correct: 1,
        explanation: "Cooperación definida en el documento :contentReference[oaicite:54]{index=54}.",
      },
      {
        q: "En el ejemplo cooperativo, un mensaje típico tiene tipo…",
        options: ["login", "comida_encontrada", "render", "logout"],
        correct: 1,
        explanation: "El ejemplo usa el tipo 'comida_encontrada' para compartir posiciones :contentReference[oaicite:55]{index=55}.",
      },
      {
        q: "¿Por qué la comunicación ayuda?",
        options: ["Aumenta los errores", "Permite coordinación distribuida", "Elimina el objetivo", "Impide percibir"],
        correct: 1,
        explanation: "Comunicación habilita coordinación distribuida :contentReference[oaicite:56]{index=56}.",
      },
    ],
  },

  // =========================
  // NIVEL 7 - Competitivo (recursos limitados)
  // =========================
  {
    id: "lvl-7",
    level: 7,
    title: "Competitivo: agentes compiten por recursos limitados",
    summary:
      "Introduce competencia: varios agentes persiguen recursos escasos; evita que todos vayan al mismo objetivo.",
    estimatedMinutes: 22,
    theoryCards: [
      {
        title: "Competencia en MAS",
        bullets: [
          "Competencia: agentes compiten por recursos limitados :contentReference[oaicite:57]{index=57}.",
          "Ejercicio propuesto: agentes compitan por recursos limitados :contentReference[oaicite:58]{index=58}.",
        ],
      },
      {
        title: "Conflictos típicos",
        bullets: [
          "Colisiones o choques por la misma celda.",
          "Dos agentes corren al mismo recurso (ineficiente).",
          "Solución simple: desempate por id o ‘reservas’ del objetivo.",
        ],
      },
      {
        title: "Reglas de desempate (simple)",
        bullets: [
          "Si dos agentes eligen la misma comida: gana el que esté más cerca.",
          "Si empatan distancia: gana el de menor id (regla determinista).",
        ],
      },
    ],
    glossary: [
      { term: "Competencia", def: "Agentes compiten por recursos finitos/escasos." },
      { term: "Desempate", def: "Regla para decidir quién toma un recurso cuando hay conflicto." },
    ],
    codeExampleTitle: "Ejemplo: desempate por distancia y id",
    codeExample: `def elegir_ganador(candidatos):
    # candidatos: [(id, dist), ...]
    # regla: menor dist, y si empata menor id
    return min(candidatos, key=lambda t: (t[1], t[0]))
`,
    activity: {
      title: "Actividad",
      prompt:
        "Implementa elegir_ganador(candidatos) usando min(..., key=lambda ...).",
      starter: `def elegir_ganador(candidatos):
    # candidatos: lista de (id, dist)
    # TODO: retorna el (id, dist) ganador
    return None
`,
      rules: {
        mustInclude: ["min(", "key=lambda", "return"],
        mustIncludeAny: ["dist", "id"],
      },
      tips: [
        "Este patrón evita que el sistema sea ‘caótico’ cuando hay conflictos.",
        "Más adelante puedes añadir castigos por choque o reglas de negociación.",
      ],
    },
    quiz: [
      {
        q: "En MAS, la competencia ocurre cuando…",
        options: [
          "Solo hay un agente",
          "Agentes compiten por recursos limitados",
          "No existe entorno",
          "Todos cooperan siempre",
        ],
        correct: 1,
        explanation: "Competencia definida en el documento :contentReference[oaicite:59]{index=59}.",
      },
      {
        q: "El documento propone como ejercicio…",
        options: [
          "Eliminar comida del entorno",
          "Que agentes compitan por recursos limitados",
          "Que el entorno sea continuo siempre",
          "No usar planificación",
        ],
        correct: 1,
        explanation: "Ejercicio explícito :contentReference[oaicite:60]{index=60}.",
      },
      {
        q: "Una regla determinista de desempate sirve para…",
        options: [
          "Generar más conflictos",
          "Evitar decisiones ambiguas cuando dos agentes quieren lo mismo",
          "Romper la simulación",
          "Quitar autonomía",
        ],
        correct: 1,
        explanation: "Reduce conflictos y hace el sistema reproducible.",
      },
      {
        q: "Una regla común de desempate es…",
        options: [
          "Siempre gana el último",
          "Gana el más cercano; si empata, menor id",
          "Gana el más lejano",
          "Gana el que no se movió",
        ],
        correct: 1,
        explanation: "Es una regla simple y estable para competencia.",
      },
    ],
  },

  // =========================
  // NIVEL 8 - Aprendizaje (Q-Learning) + frameworks
  // =========================
  {
    id: "lvl-8",
    level: 8,
    title: "Agente con aprendizaje: idea de refuerzo (Q-Learning)",
    summary:
      "Conecta el concepto de ‘agente con aprendizaje’ con recompensas y aprendizaje por refuerzo (Q-Learning), y herramientas recomendadas.",
    estimatedMinutes: 30,
    theoryCards: [
      {
        title: "Agente con aprendizaje (del documento)",
        bullets: [
          "Mejora su comportamiento con la experiencia: inicia aleatorio, observa recompensas, ajusta estrategia :contentReference[oaicite:61]{index=61}.",
          "Desventaja: requiere muchas iteraciones de entrenamiento :contentReference[oaicite:62]{index=62}.",
        ],
      },
      {
        title: "Idea de Q-Learning",
        bullets: [
          "Q(s,a) ≈ valor esperado de tomar acción a en estado s.",
          "Actualizar usando recompensa y el mejor valor futuro: Q ← Q + α [r + γ max Q(s’,a’) − Q].",
          "Esto encaja con ‘agentes con IA que aprenden’ y entornos tipo Gym/Gymnasium :contentReference[oaicite:63]{index=63}.",
        ],
      },
      {
        title: "Herramientas recomendadas (del documento)",
        bullets: [
          "Mesa para simulación ABM (MultiGrid, activación) :contentReference[oaicite:64]{index=64}.",
          "Gym/Gymnasium para aprendizaje por refuerzo :contentReference[oaicite:65]{index=65}.",
        ],
      },
    ],
    glossary: [
      { term: "Recompensa", def: "Señal numérica que guía el aprendizaje." },
      { term: "Q(s,a)", def: "Valor de acción a en estado s (retorno esperado)." },
      { term: "α (alpha)", def: "Tasa de aprendizaje." },
      { term: "γ (gamma)", def: "Descuento del futuro." },
    ],
    codeExampleTitle: "Ejemplo: Q-Table en dict (estructura)",
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
      title: "Actividad",
      prompt:
        "Implementa get_q usando Q.get((state,action), 0.0) y choose_action con ε-greedy.",
      starter: `import random

ACTIONS = ["arriba", "abajo", "izquierda", "derecha"]
Q = {}

def get_q(state, action):
    # TODO: devolver Q.get((state, action), 0.0)
    return 0.0

def choose_action(state, eps=0.2):
    # TODO: if random.random() < eps => random.choice(ACTIONS)
    # else => max(ACTIONS, key=lambda a: get_q(state, a))
    return "arriba"
`,
      rules: {
        mustInclude: ["Q = {}", "Q.get(", "(state, action)", "random.random", "random.choice", "max(", "key=lambda"],
        mustIncludeAny: ["eps", "q"],
      },
      tips: [
        "Esto prepara tu plataforma para el futuro ‘ejecutar código seguro’ y motor de simulación.",
        "El documento recomienda Gym/Gymnasium para RL :contentReference[oaicite:66]{index=66}.",
      ],
    },
    quiz: [
      {
        q: "Un agente con aprendizaje, según el documento…",
        options: [
          "Nunca cambia su estrategia",
          "Comienza aleatorio, observa recompensas y ajusta",
          "Solo funciona con comunicación",
          "No necesita entorno",
        ],
        correct: 1,
        explanation: "Descripción literal del documento :contentReference[oaicite:67]{index=67}.",
      },
      {
        q: "¿Qué representa Q(s,a)?",
        options: ["Un color", "Un valor esperado de tomar acción a en estado s", "Una coordenada", "Un obstáculo"],
        correct: 1,
        explanation: "Q(s,a) modela el ‘valor’ de acciones por estado.",
      },
      {
        q: "¿Cuál librería/entorno se recomienda para RL en el documento?",
        options: ["Django", "Gym/Gymnasium", "Flask", "Tkinter"],
        correct: 1,
        explanation: "Se menciona Gym/Gymnasium para agentes que aprenden :contentReference[oaicite:68]{index=68}.",
      },
      {
        q: "¿Qué costo típico tiene el aprendizaje?",
        options: ["Ninguno", "Requiere muchas iteraciones de entrenamiento", "Elimina la necesidad de entorno", "No requiere recompensas"],
        correct: 1,
        explanation: "El documento lo indica como desventaja :contentReference[oaicite:69]{index=69}.",
      },
    ],
  },
]
