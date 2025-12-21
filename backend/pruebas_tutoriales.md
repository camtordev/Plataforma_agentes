# Códigos de Prueba para Tutoriales - Defensa del Proyecto

Este documento contiene códigos de ejemplo para demostrar el sistema de validación en cada nivel del tutorial.

---

## NIVEL 1: Fundamentos - Arquitectura de Agentes Inteligentes

### ✅ CÓDIGO APROBADO
```python
# ============================================
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
    # Implementación básica que retorna una acción válida
    return "UP"
```

**Por qué se aprueba:**
- ✅ Contiene `def act`
- ✅ Contiene `return`
- ✅ Retorna una acción válida del conjunto requerido ("UP")
- ✅ Estructura sintácticamente correcta

---

### ❌ CÓDIGO RECHAZADO
```python
def act(observation):
    """
    Función de decisión del agente.
    
    Args:
        observation (dict): Datos del entorno visibles para el agente
    """
    # ERROR: No retorna nada
    accion = "UP"
    # Falta el return
```

**Por qué se rechaza:**
- ❌ Falta la sentencia `return` - La función no devuelve ningún valor
- Aunque define una variable con una acción válida, nunca la retorna
- El agente quedaría sin capacidad de actuar en el entorno

---

## NIVEL 2: Agentes Reactivos - Arquitectura Estímulo-Respuesta

### ✅ CÓDIGO APROBADO
```python
import random

def decidir_y_actuar(percepcion):
    """
    Agente reactivo simple para limpieza.
    Si detecta suciedad, limpia. Si no, se mueve aleatoriamente.
    
    Args:
        percepcion (bool): True si hay suciedad en la posición actual
        
    Returns:
        str: Acción a realizar
    """
    if percepcion:
        return "limpiar"
    else:
        return random.choice(["arriba", "abajo", "izquierda", "derecha"])
```

**Por qué se aprueba:**
- ✅ Importa `random`
- ✅ Define `def decidir_y_actuar`
- ✅ Usa `random.choice`
- ✅ Contiene `return`
- ✅ Incluye acción "limpiar" y direcciones de movimiento
- ✅ Implementa lógica reactiva correcta (if/else)

---

### ❌ CÓDIGO RECHAZADO
```python
# ERROR: Falta importar random
def decidir_y_actuar(percepcion):
    """
    Intento de agente reactivo con error crítico.
    """
    if percepcion:
        return "limpiar"
    
    # ERROR: random no está definido
    return random.choice(["arriba", "abajo", "izquierda", "derecha"])
```

**Por qué se rechaza:**
- ❌ Falta `import random` - Causará un NameError en tiempo de ejecución
- Aunque la estructura lógica es correcta, el código no puede ejecutarse
- El sistema debe detectar la falta de la importación requerida

---

## NIVEL 3: Agentes con Estado Interno - Memoria y Exploración

### ✅ CÓDIGO APROBADO
```python
class AgenteConMemoria:
    def __init__(self, x, y):
        """
        Inicializa el agente con memoria de posiciones visitadas.
        
        Args:
            x (int): Posición inicial en eje X
            y (int): Posición inicial en eje Y
        """
        self.x = x
        self.y = y
        # Inicializar set con la posición inicial
        self.visitados = set([(x, y)])

    def marcar_visitado(self):
        """
        Marca la posición actual como visitada.
        """
        self.visitados.add((self.x, self.y))
```

**Por qué se aprueba:**
- ✅ Define `self.visitados` como un set
- ✅ Usa `set(` para inicialización
- ✅ Implementa método `marcar_visitado`
- ✅ Usa `add(` para agregar elementos
- ✅ Utiliza tuplas `(self.x, self.y)` correctamente
- ✅ La posición inicial ya está en visitados

---

### ❌ CÓDIGO RECHAZADO
```python
class AgenteConMemoria:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        # ERROR: Usa lista en vez de set
        self.visitados = [[x, y]]

    def marcar_visitado(self):
        # ERROR: append en lista, no es eficiente y usa lista en vez de tupla
        self.visitados.append([self.x, self.y])
```

**Por qué se rechaza:**
- ❌ No usa `set(` - Usa lista en vez de set
- ❌ No usa `add(` - Usa append (de listas)
- ❌ Usa listas `[x, y]` en vez de tuplas `(x, y)`
- Problemas de rendimiento: búsquedas O(n) en vez de O(1)
- Listas no son hashables, no pueden usarse en sets más adelante

---

## NIVEL 4: Agentes Basados en Objetivos - Planificación con BFS

### ✅ CÓDIGO APROBADO
```python
from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    """
    Implementa BFS para encontrar el camino más corto.
    
    Args:
        x0, y0 (int): Posición inicial
        objetivo (tuple): Coordenadas del objetivo (x, y)
        entorno: Objeto con métodos es_valido() y hay_obstaculo()
        
    Returns:
        list: Secuencia de acciones para llegar al objetivo
    """
    # Caso especial: sin objetivo
    if objetivo is None:
        return []
    
    # Inicializar BFS
    cola = deque([(x0, y0, [])])
    visitados = {(x0, y0)}
    
    while cola:
        x, y, camino = cola.popleft()
        
        # Verificar si llegamos al objetivo
        if (x, y) == objetivo:
            return camino
        
        # Explorar vecinos en 4 direcciones
        for dx, dy, accion in [(0, -1, "arriba"), (0, 1, "abajo"), 
                                (-1, 0, "izquierda"), (1, 0, "derecha")]:
            nx, ny = x + dx, y + dy
            
            # Verificar si el vecino es válido
            if (entorno.es_valido(nx, ny) and 
                (nx, ny) not in visitados and 
                not entorno.hay_obstaculo(nx, ny)):
                
                visitados.add((nx, ny))
                cola.append((nx, ny, camino + [accion]))
    
    return []
```

**Por qué se aprueba:**
- ✅ Importa `from collections import deque`
- ✅ Usa `deque(` para crear la cola
- ✅ Define `visitados` para evitar ciclos
- ✅ Usa `while` para el loop principal
- ✅ Usa `popleft` (FIFO) - Característica clave de BFS
- ✅ Contiene `return`
- ✅ Incluye direcciones ("arriba", "abajo", "izquierda", "derecha")
- ✅ Estructura completa de BFS

---

### ❌ CÓDIGO RECHAZADO
```python
from collections import deque

def planificar_ruta(x0, y0, objetivo, entorno):
    """
    Intento incorrecto de BFS - usa pop() en vez de popleft()
    """
    if objetivo is None:
        return []
    
    cola = deque([(x0, y0, [])])
    visitados = {(x0, y0)}
    
    while cola:
        # ERROR: usa pop() en vez de popleft()
        # Esto convierte el algoritmo en DFS, no BFS
        x, y, camino = cola.pop()
        
        if (x, y) == objetivo:
            return camino
        
        for dx, dy, accion in [(0, -1, "arriba"), (0, 1, "abajo"), 
                                (-1, 0, "izquierda"), (1, 0, "derecha")]:
            nx, ny = x + dx, y + dy
            
            if (entorno.es_valido(nx, ny) and 
                (nx, ny) not in visitados and 
                not entorno.hay_obstaculo(nx, ny)):
                
                visitados.add((nx, ny))
                cola.append((nx, ny, camino + [accion]))
    
    return []
```

**Por qué se rechaza:**
- ❌ Usa `pop()` en vez de `popleft()` - Esto es DFS (Last-In-First-Out), no BFS
- Aunque tiene todas las importaciones y estructura, el algoritmo es incorrecto
- No garantiza el camino más corto (propiedad fundamental de BFS)
- Viola el requisito `mustInclude: ["popleft"]`

---

## NIVEL 5: Búsqueda Informada - A* con Heurística Manhattan

### ✅ CÓDIGO APROBADO
```python
import heapq

def manhattan(a, b):
    """
    Calcula la distancia Manhattan entre dos puntos.
    
    Args:
        a (tuple): Coordenadas (x, y) del primer punto
        b (tuple): Coordenadas (x, y) del segundo punto
        
    Returns:
        int: Distancia Manhattan |dx| + |dy|
    """
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(inicio, objetivo, entorno):
    """
    Implementa A* con heurística Manhattan.
    
    Args:
        inicio (tuple): Coordenadas iniciales (x, y)
        objetivo (tuple): Coordenadas del objetivo (x, y)
        entorno: Objeto con información del grid
        
    Returns:
        list: Secuencia de acciones para llegar al objetivo
    """
    if objetivo is None:
        return []
    
    # Cola de prioridad: (f, g, x, y, camino)
    open_set = []
    heapq.heappush(open_set, (0, 0, inicio[0], inicio[1], []))
    
    # Mejor costo conocido para cada posición
    g_score = {inicio: 0}
    
    while open_set:
        f, g, x, y, camino = heapq.heappop(open_set)
        
        # Verificar si llegamos al objetivo
        if (x, y) == objetivo:
            return camino
        
        # Explorar vecinos
        for dx, dy, accion in [(0, -1, "arriba"), (0, 1, "abajo"), 
                                (-1, 0, "izquierda"), (1, 0, "derecha")]:
            nx, ny = x + dx, y + dy
            
            if entorno.es_valido(nx, ny) and not entorno.hay_obstaculo(nx, ny):
                # Calcular nuevos costos
                nuevo_g = g + 1
                
                # Si encontramos un mejor camino
                if (nx, ny) not in g_score or nuevo_g < g_score[(nx, ny)]:
                    g_score[(nx, ny)] = nuevo_g
                    h = manhattan((nx, ny), objetivo)
                    nuevo_f = nuevo_g + h
                    
                    heapq.heappush(open_set, (nuevo_f, nuevo_g, nx, ny, camino + [accion]))
    
    return []
```

**Por qué se aprueba:**
- ✅ Importa `import heapq`
- ✅ Define `def manhattan` con `abs(` para calcular distancia
- ✅ Define `def astar` 
- ✅ Usa `heapq` para cola de prioridad
- ✅ Usa variables `f`, `g`, `h` (costo total, acumulado, heurística)
- ✅ Implementa correctamente f = g + h
- ✅ Estructura completa de A*

---

### ❌ CÓDIGO RECHAZADO
```python
import heapq

def manhattan(a, b):
    """
    ERROR: Heurística incorrecta - usa distancia euclidiana
    """
    # ERROR: No es Manhattan, es Euclidiana
    return ((a[0] - b[0])**2 + (a[1] - b[1])**2)**0.5

def astar(inicio, objetivo, entorno):
    """
    A* con heurística incorrecta
    """
    if objetivo is None:
        return []
    
    open_set = []
    heapq.heappush(open_set, (0, 0, inicio[0], inicio[1], []))
    visitados = set()
    
    while open_set:
        f, g, x, y, camino = heapq.heappop(open_set)
        
        if (x, y) in visitados:
            continue
        visitados.add((x, y))
        
        if (x, y) == objetivo:
            return camino
        
        for dx, dy, accion in [(0, -1, "arriba"), (0, 1, "abajo"), 
                                (-1, 0, "izquierda"), (1, 0, "derecha")]:
            nx, ny = x + dx, y + dy
            
            if entorno.es_valido(nx, ny) and not entorno.hay_obstaculo(nx, ny):
                nuevo_g = g + 1
                # Usa la heurística incorrecta
                h = manhattan((nx, ny), objetivo)
                nuevo_f = nuevo_g + h
                heapq.heappush(open_set, (nuevo_f, nuevo_g, nx, ny, camino + [accion]))
    
    return []
```

**Por qué se rechaza:**
- ❌ La función `manhattan` NO calcula Manhattan - Calcula distancia Euclidiana
- Manhattan debe ser `|dx| + |dy|`, no `sqrt(dx² + dy²)`
- Aunque usa la estructura correcta de A*, la heurística es inadmisible para grids con movimiento cardinal
- Puede sobreestimar el costo real, violando las propiedades de A*

---

## NIVEL 6: Sistemas Multi-Agente - Comunicación y Cooperación

### ✅ CÓDIGO APROBADO
```python
class AgenteCooperativo:
    def __init__(self, id):
        """
        Inicializa un agente cooperativo con capacidad de mensajería.
        
        Args:
            id: Identificador único del agente
        """
        self.id = id
        self.mensajes = []

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        """
        Envía un mensaje a una lista de agentes destinatarios.
        
        Args:
            destinatarios (list): Lista de agentes receptores
            tipo (str): Tipo de mensaje (ej: 'comida_encontrada')
            contenido: Información a comunicar (ej: posición)
        """
        for agente in destinatarios:
            agente.recibir_mensaje(self.id, tipo, contenido)

    def recibir_mensaje(self, remitente, tipo, contenido):
        """
        Recibe y almacena un mensaje de otro agente.
        
        Args:
            remitente: ID del agente que envía el mensaje
            tipo (str): Tipo de mensaje
            contenido: Datos del mensaje
        """
        self.mensajes.append({
            "de": remitente,
            "tipo": tipo,
            "contenido": contenido
        })
    
    def procesar_mensajes(self, tipo_filtro=None):
        """
        Procesa los mensajes recibidos, opcionalmente filtrando por tipo.
        
        Args:
            tipo_filtro (str, optional): Filtrar solo mensajes de este tipo
            
        Returns:
            list: Lista de mensajes procesados
        """
        mensajes_procesados = []
        
        for mensaje in self.mensajes:
            if tipo_filtro is None or mensaje["tipo"] == tipo_filtro:
                mensajes_procesados.append(mensaje)
        
        # Limpiar bandeja después de procesar
        self.mensajes = []
        
        return mensajes_procesados
```

**Por qué se aprueba:**
- ✅ Define `self.mensajes` como lista
- ✅ Usa `append` para agregar mensajes
- ✅ Implementa `recibir_mensaje` correctamente
- ✅ Implementa `enviar_mensaje` con loop sobre destinatarios
- ✅ Estructura de mensaje incluye "de", "tipo", "contenido"
- ✅ Sistema completo de comunicación

---

### ❌ CÓDIGO RECHAZADO
```python
class AgenteCooperativo:
    def __init__(self, id):
        self.id = id
        # ERROR: Usa string en vez de lista
        self.mensajes = ""

    def enviar_mensaje(self, destinatarios, tipo, contenido):
        """
        ERROR: No itera sobre destinatarios correctamente
        """
        # ERROR: Solo envía al primer destinatario
        if len(destinatarios) > 0:
            destinatarios[0].recibir_mensaje(self.id, tipo, contenido)

    def recibir_mensaje(self, remitente, tipo, contenido):
        """
        ERROR: Intenta hacer append a un string
        """
        # ERROR: mensajes es string, no lista
        # Esto causará AttributeError: 'str' object has no attribute 'append'
        self.mensajes.append({"de": remitente, "tipo": tipo, "contenido": contenido})
```

**Por qué se rechaza:**
- ❌ `self.mensajes` es un string, no una lista - No se puede usar `append`
- ❌ `enviar_mensaje` no itera correctamente - Solo envía al primer destinatario
- ❌ Causará error en runtime al intentar append en string
- Sistema de comunicación incompleto y defectuoso

---

## NIVEL 7: Competencia y Resolución de Conflictos

### ✅ CÓDIGO APROBADO
```python
def elegir_ganador(candidatos):
    """
    Determina el ganador en un conflicto por recursos usando reglas de desempate.
    
    Reglas de prioridad (en orden):
    1. Menor distancia al recurso
    2. En caso de empate, menor ID
    
    Args:
        candidatos (list): Lista de tuplas (id, dist) donde:
            - id: Identificador del agente
            - dist: Distancia al recurso disputado
            
    Returns:
        tuple: (id, dist) del agente ganador
        
    Ejemplo:
        >>> elegir_ganador([(3, 5), (1, 5), (2, 3)])
        (2, 3)  # Gana por menor distancia
        
        >>> elegir_ganador([(3, 5), (1, 5)])
        (1, 5)  # Empate en distancia, gana por menor ID
    """
    # Usa min con key personalizada
    # Primero compara por distancia (t[1]), luego por ID (t[0])
    return min(candidatos, key=lambda t: (t[1], t[0]))

# Ejemplo de uso en sistema de resolución de conflictos
def resolver_conflicto_recurso(recurso_pos, agentes_interesados):
    """
    Resuelve conflictos cuando múltiples agentes quieren el mismo recurso.
    
    Args:
        recurso_pos (tuple): Posición (x, y) del recurso
        agentes_interesados (list): Lista de agentes que quieren el recurso
        
    Returns:
        Agente ganador que obtiene el recurso
    """
    # Calcular distancia de cada agente al recurso
    candidatos = []
    for agente in agentes_interesados:
        dist = abs(agente.x - recurso_pos[0]) + abs(agente.y - recurso_pos[1])
        candidatos.append((agente.id, dist))
    
    # Determinar ganador
    id_ganador, _ = elegir_ganador(candidatos)
    
    # Encontrar y retornar el agente ganador
    for agente in agentes_interesados:
        if agente.id == id_ganador:
            return agente
    
    return None
```

**Por qué se aprueba:**
- ✅ Usa `min(` con criterio personalizado
- ✅ Usa `key=lambda` para especificar orden de comparación
- ✅ Contiene `return`
- ✅ Menciona "dist" e "id" en el código
- ✅ Orden correcto: primero distancia `t[1]`, luego id `t[0]`
- ✅ Sistema determinista y reproducible

---

### ❌ CÓDIGO RECHAZADO
```python
import random

def elegir_ganador(candidatos):
    """
    ERROR: Resolución aleatoria en vez de determinista
    """
    # ERROR: Usa random en vez de reglas deterministas
    # Esto hace que el sistema sea impredecible y dificulta la depuración
    return random.choice(candidatos)

# Alternativa también rechazada:
def elegir_ganador_incorrecto(candidatos):
    """
    ERROR: Orden de prioridad invertido
    """
    # ERROR: Prioriza ID antes que distancia
    # Debería ser (t[1], t[0]) para distancia primero
    return min(candidatos, key=lambda t: (t[0], t[1]))
```

**Por qué se rechaza:**
- ❌ Primera versión: Usa `random.choice` - No es determinista
  - Mismos inputs pueden dar diferentes outputs
  - Imposible reproducir comportamientos para debugging
  - No implementa las reglas de prioridad especificadas
  
- ❌ Segunda versión: Orden de prioridad invertido
  - Prioriza ID antes que distancia `(t[0], t[1])`
  - Debería ser `(t[1], t[0])` (distancia primero, ID segundo)
  - Viola la lógica del negocio: el agente más cercano debería ganar

---

## NIVEL 8: Aprendizaje por Refuerzo - Q-Learning Básico

### ✅ CÓDIGO APROBADO
```python
import random

# Definir acciones posibles
ACTIONS = ["arriba", "abajo", "izquierda", "derecha"]

# Tabla Q: diccionario que mapea (estado, acción) -> valor Q
Q = {}

def get_q(state, action):
    """
    Obtiene el valor Q para un par (estado, acción).
    Si no existe, retorna 0.0 (optimista inicial).
    
    Args:
        state: Representación del estado (puede ser tupla, string, etc.)
        action (str): Acción a evaluar
        
    Returns:
        float: Valor Q estimado
    """
    return Q.get((state, action), 0.0)

def choose_action(state, eps=0.2):
    """
    Selecciona una acción usando estrategia ε-greedy.
    
    Args:
        state: Estado actual del agente
        eps (float): Probabilidad de exploración (0.0 a 1.0)
        
    Returns:
        str: Acción seleccionada
    """
    # Exploración: con probabilidad eps, elegir acción aleatoria
    if random.random() < eps:
        return random.choice(ACTIONS)
    
    # Explotación: elegir la mejor acción conocida (mayor valor Q)
    return max(ACTIONS, key=lambda a: get_q(state, a))

def update_q(state, action, reward, next_state, alpha=0.1, gamma=0.9):
    """
    Actualiza el valor Q usando la ecuación de Bellman.
    
    Q(s,a) ← Q(s,a) + α[r + γ·max_a' Q(s',a') - Q(s,a)]
    
    Args:
        state: Estado actual
        action: Acción tomada
        reward: Recompensa recibida
        next_state: Estado resultante
        alpha: Tasa de aprendizaje (0 a 1)
        gamma: Factor de descuento (0 a 1)
    """
    # Valor Q actual
    current_q = get_q(state, action)
    
    # Mejor valor Q posible en el siguiente estado
    max_next_q = max([get_q(next_state, a) for a in ACTIONS])
    
    # Ecuación de Bellman
    new_q = current_q + alpha * (reward + gamma * max_next_q - current_q)
    
    # Actualizar tabla Q
    Q[(state, action)] = new_q

# Ejemplo de uso en un episodio de entrenamiento
def entrenar_episodio(env, num_steps=100):
    """
    Ejecuta un episodio de entrenamiento con Q-Learning.
    
    Args:
        env: Entorno de simulación
        num_steps: Número máximo de pasos por episodio
        
    Returns:
        float: Recompensa total acumulada
    """
    state = env.reset()
    total_reward = 0
    
    for _ in range(num_steps):
        # Seleccionar acción (más exploración al inicio)
        action = choose_action(state, eps=0.3)
        
        # Ejecutar acción en el entorno
        next_state, reward, done = env.step(action)
        
        # Actualizar Q-table
        update_q(state, action, reward, next_state)
        
        # Acumular recompensa
        total_reward += reward
        
        # Preparar siguiente iteración
        state = next_state
        
        if done:
            break
    
    return total_reward
```

**Por qué se aprueba:**
- ✅ Define `Q = {}` como diccionario
- ✅ Usa `Q.get(` con valor por defecto
- ✅ Usa `random.random` para decisión estocástica
- ✅ Usa `random.choice` para exploración
- ✅ Usa `max(` con `key=lambda` para explotación
- ✅ Menciona "eps" (epsilon) para exploración
- ✅ Menciona "q" en variables
- ✅ Implementa correctamente ε-greedy
- ✅ Estructura completa de Q-Learning

---

### ❌ CÓDIGO RECHAZADO
```python
# ERROR: No importa random
ACTIONS = ["arriba", "abajo", "izquierda", "derecha"]

# Usa lista en vez de diccionario
# ERROR: Estructura incorrecta para Q-table
Q = []

def get_q(state, action):
    """
    ERROR: Q es lista, no diccionario - no puede usar .get()
    """
    # ERROR: Esto causará AttributeError
    return Q.get((state, action), 0.0)

def choose_action(state, eps=0.2):
    """
    ERROR: Nunca explora - siempre explota
    """
    # ERROR: Ignora completamente eps (exploración)
    # Solo hace explotación, nunca explora estados nuevos
    # Esto causa convergencia a óptimos locales
    best_action = None
    best_value = -float('inf')
    
    for action in ACTIONS:
        q_value = get_q(state, action)
        if q_value > best_value:
            best_value = q_value
            best_action = action
    
    return best_action
```

**Por qué se rechaza:**
- ❌ Falta `import random` - Necesario para exploración
- ❌ `Q` es lista, no diccionario - No puede almacenar pares (estado, acción)
- ❌ `Q.get()` fallará - Las listas no tienen método .get()
- ❌ `choose_action` ignora `eps` - Nunca explora
  - Sin exploración, el agente se estanca en óptimos locales
  - No puede descubrir mejores estrategias
  - Viola el principio fundamental de ε-greedy
- ❌ No usa `random.random` ni `random.choice` - Requisitos del nivel

---

## Resumen de Validaciones por Nivel

| Nivel | Validaciones Clave | Errores Comunes a Detectar |
|-------|-------------------|---------------------------|
| **1** | `def act`, `return`, acción válida | Falta return, tipo incorrecto |
| **2** | `import random`, `random.choice`, `if/else` | Falta import, lógica incompleta |
| **3** | `set(`, `add(`, tuplas `(x,y)` | Usar listas, no actualizar visitados |
| **4** | `deque`, `popleft`, `while`, visitados | Usar pop() (DFS), olvidar visitados |
| **5** | `heapq`, `manhattan` con `abs`, `f=g+h` | Heurística incorrecta, no usar heap |
| **6** | `self.mensajes`, `append`, estructura dict | Tipo incorrecto, no iterar destinatarios |
| **7** | `min(`, `key=lambda`, orden (dist, id) | Aleatorio, orden invertido |
| **8** | `Q={}`, `Q.get(`, `random`, ε-greedy | No explorar, estructura incorrecta |

---

## Recomendaciones para la Defensa

1. **Demostrar el sistema de validación**: Copiar código aprobado → mostrar feedback positivo → copiar código rechazado → mostrar mensajes de error específicos

2. **Destacar la progresión didáctica**: Los errores reflejan conceptos mal entendidos reales que estudiantes cometen

3. **Enfatizar la robustez**: El sistema detecta tanto errores sintácticos como conceptuales

4. **Mostrar casos edge**: Olvidos de imports, tipos incorrectos, algoritmos implementados incorrectamente

5. **Explicar el valor pedagógico**: Cada rechazo es una oportunidad de aprendizaje con feedback específico
