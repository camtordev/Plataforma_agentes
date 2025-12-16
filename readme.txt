#Plataforma Educativa de Programación Basada en Agentes

Esta es una plataforma web interactiva diseñada para el aprendizaje de sistemas multi-agente. [cite_start]Permite a los usuarios visualizar simulaciones en tiempo real, editar código Python y observar el comportamiento de agentes en un entorno de cuadrícula (Grid)[cite: 14].

## Arquitectura

El proyecto utiliza una arquitectura desacoplada **Cliente-Servidor**:

* **Frontend:** React (Vite) + Konva (Renderizado Gráfico Optimizado).
* **Backend:** Python (FastAPI) + WebSockets (Comunicación Tiempo Real).
* **Infraestructura:** Docker (PostgreSQL para datos y Redis para cola de mensajes/cache).

##  Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

1.  **Docker Desktop** (Debe estar corriendo para la base de datos y Redis).
2.  **Python 3.10** o superior.
3.  **Node.js 18** o superior.
4.  **Git**.

---

##  Guía de Instalación y Ejecución

Sigue estos pasos en orden para levantar el entorno de desarrollo.

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd plataforma-agentes

2. Levantar Infraestructura (Base de Datos y Redis)
Ejecuta este comando en la raíz del proyecto para iniciar los contenedores de PostgreSQL y Redis:
    docker-compose up -d

3. Configurar el Backend (Python)
Abre una nueva terminal y navega a la carpeta del backend:
    cd backend
    Crear y activar entorno virtual:
        python -m venv venv
        venv\Scripts\activate

    Instalar dependencias:
        pip install -r requirements.txt
    Iniciar el Servidor:
        uvicorn app.main:app --reload

Configurar el Frontend (React)

    cd frontend
    npm install
    npm run dev

Cómo Usar
Asegúrate de tener corriendo tanto el Backend (puerto 8000) como el Frontend (puerto 5173).

Abre tu navegador y ve a http://localhost:5173.

Deberías ver el Grid Interactivo.

Si la conexión es exitosa, verás agentes (puntos de colores) moviéndose automáticamente, controlados por la lógica del servidor Python vía WebSockets.


Estructura de Archivos del Backend (Python/FastAPI)
backend/
├── app/
|    ├── agents/                  # 🧠 LÓGICA DE AGENTES (Jerarquía de Clases)
│   ├── __init__.py             Para exponer los módulos
    ├── models.py             # Clase 'Agent' base (estado, memoria, inbox, q_table)
│   ├── base.py              # Clase abstracta 'Agent' (x, y, energy)
│   └── factory.py            #Factory actualizado para crear Reactive, Explorer, Coop, RL, etc.
│   ├── reactive.py          # Agente simple (estímulo-respuesta)
│   ├── goal_based.py        # Agente complejo (planificación)
│   ├── model_based.py       # Agente con memoria del mundo
│   └── utility.py           # Funciones de utilidad y métricas
│
├── algorithms/              # 📐 ALGORITMOS DE BÚSQUEDA Y PATHFINDING
│   ├── __init__.py
│   └── search.py            # Implementación de BFS, DFS, A*
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Login y Registro
│   │   │   │   ├── projects.py      # Guardado/Carga de proyectos [cite: 96]
│   │   │   │   ├── tutorials.py     # Gestión de niveles pedagógicos [cite: 73]
│   │   │   │   └── analysis.py      # Endpoints para gráficas y stats [cite: 113]
                ├── simulation_ws.py  # Endpoint WebSocket blindado contra desconexiones
│   │   │   └── api.py
│   │   └── deps.py                  # Dependencias (DB session, Current User)
│   │
│   ├── core/
│   │   ├── config.py                # Variables de entorno
│   │   └── security.py              # JWT y Hashing
│   │
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── models/                  # Modelos SQLAlchemy
│   │       ├── user.py
│   │       ├── project.py
│   │       └── metrics.py           # Stats para el RF6 [cite: 112]
│   │
│   ├── schemas/                     # Pydantic Models (Validación de datos)
│   │   ├── agent.py                 # Esquema de propiedades del agente [cite: 36]
│   │   ├── grid.py                  # Esquema del entorno 50x50 [cite: 25]
│   │   └── simulation.py
│   │
│   ├── services/
│   │   ├── engine/                  # EL CORAZÓN DEL SISTEMA [cite: 39]
│   │   │   ├── __init__.py
│   │   │   ├── world.py             # Lógica del Grid y colisiones
│   │   │   ├── agent_controller.py  # Ciclo Percibir-Decidir-Actuar [cite: 41]
│   │   │   └── loop.py              # Loop asíncrono principal
│   │   │
│   │   └── sandbox/                 # Ejecución Segura 
│   │   |    ├── docker_client.py     # Conexión con contenedores
│   │   |    └── code_parser.py       # Validación estática antes de ejecutar
        |
│   │   └── game_instance.py      # Singleton para mantener la instancia del engine en memoria
│   │
│   ├── websockets/                  # Comunicación Tiempo Real 
│   │   ├── connection_manager.py    # Manejo de broadcast con try/except para evitar crasheos
│   │   └── events.py                # Procesador de comandos (START, PAUSE, ADD_AGENT)
│   │
│   └── main.py                      # Punto de entrada (FastAPI, rutas WebSocket)
|    └── simulation.py            # [REFACTORIZADO] EL MOTOR PRINCIPAL. Contiene:
│   │                             # 1. Loop 'step' (Física y Reglas)
│   │                             # 2. Dispatcher de IA (_get_agent_decision)
│   │                             # 3. Integración con Pathfinding y Factory    
├── alembic/                         # Migraciones de Base de Datos
├── tests/
├── requirements.txt
└── docker-compose.yml               # Orquestación (App, DB, Redis)


Puntos Clave del Backend:

    - services/engine/: Aquí reside la lógica que mueve a los 100 agentes. No está en la vista (API), sino en un servicio dedicado que corre en memoria.

    - sandbox/: Es el módulo encargado de tomar el string de código que viene del frontend y ejecutarlo aisladamente para cumplir con el RF3.2.
            

        agents/factory.py: Desacopla la creación de agentes. Recibe un string (ej: "goal_based") y devuelve la instancia correcta con sus estrategias inyectadas.

        simulation.py: Es el orquestador de la simulación. Mantiene el estado (agents, food, obstacles), valida movimientos, gestiona colisiones y controla los turnos (step()).

Estructura de Archivos del Frontend (React + JavaScript)
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/                  # Botones, Inputs, Modales (Shadcn/UI o similar)
│   │   ├── layout/                  # Navbar, Sidebar, Layout principal
│   │   │
│   │   ├── editor/                  # Módulo del Editor de Código 
│   │   │   ├── CodeEditor.jsx       # Wrapper de Monaco Editor
│   │   │   ├── ConsoleOutput.jsx    # Muestra logs y errores
│   │   │   └── Toolbar.jsx          # Botones Play, Pause, Velocidad [cite: 45]
│   │   │
│   │   ├── simulation/              # Módulo Visual [cite: 23]
│   │   │   ├── GridCanvas.jsx       # El componente pesado (Konva/Canvas)
│   │   │   ├── AgentSprite.jsx      # Representación visual del agente
│   │   │   ├── Obstacle.jsx
│   │   │   └── Minimap.jsx          # Para grids grandes (Zoom/Pan) [cite: 29]
│   │   │
│   │   └── dashboard/               # Panel de Análisis [cite: 112]
│   │       ├── EnergyChart.jsx      # Gráfico de líneas
│   │       └── StatsCard.jsx
│   │
│   ├── context/                     # Estado Global (React Context o Zustand)
│   │   ├── AuthContext.jsx
│   │   └── SimulationContext.jsx    # ⚡ CEREBRO DEL FRONTEND
    │                                # - Mantiene la conexión WebSocket ÚNICA y Global.
    │                                # - Despacha actualizaciones de estado (Reducer).
│
│   │
│   ├── hooks/                       # Lógica reutilizable
│   │   ├── useSocket.js             # Hook auxiliar para exponer 'sendMessage' a los componentes.
│   │   ├── useGameLoop.js           # Sincronización de frames de animación
│   │   └── useKeyboard.js
│   │
│   ├── services/                    # Llamadas a la API REST
│   │   ├── api.js                   # Configuración de Axios
│   │   ├── projectService.js
│   │   └── tutorialService.js
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Workspace.jsx            # Vista principal (Grid + Editor)
│   │   ├── Tutorials.jsx            # Lista de niveles [cite: 73]
│   │   └── Login.jsx
│   │
│   ├── utils/
│   │   ├── gridHelpers.js           # Cálculos de coordenadas, pathfinding local
│   │   └── constants.js             # Configuraciones (tamaños, colores)
│   │
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
Puntos Clave del Frontend:

    - components/simulation/GridCanvas.jsx: Este es el componente más crítico. Debe usar una librería como React Konva para dibujar el grid y los agentes usando <Canvas> en lugar de miles de <div> HTML, para cumplir con el rendimiento requerido en el RF2.2.

    - hooks/useSocket.js: Este archivo escuchará los eventos del servidor (ej. update_agents) y actualizará el estado en SimulationContext, provocando que el Canvas se redibuje.



Explicación de la Lógica del Sistema
1. Arquitectura General
El sistema es un Simulador de Agentes Educativo basado en un patrón cliente-servidor en tiempo real.

Frontend (React): Actúa como "Visualizador" y "Controlador". No corre la lógica de la simulación, solo renderiza el estado (worldState) y envía comandos.

Backend (FastAPI): Es la fuente de verdad. Mantiene el estado del mundo, ejecuta el bucle de simulación (step) y resuelve conflictos.

2. El Ciclo de Vida del Agente (Factory Pattern)
Cuando el usuario arrastra un agente al grid:

Frontend: Envía un comando ADD_AGENT con un payload { type: "explorer", strategy: "bfs" }.

Backend: AgentFactory recibe el string, crea una instancia de la clase Agent (definida en models.py) y le inyecta atributos específicos (ej. agent.visited = set() si es explorador).

Identidad: El agente recibe el atributo agent.type. Este string es la clave que une la lógica de ejecución del backend con la plantilla visual del frontend.

3. El Cerebro del Agente (Dispatcher Pattern)
En simulation.py, evitamos el uso de un bloque if/else gigante dentro del bucle principal step.

Estrategia: Se usa un diccionario de dispatching: strategies = { "explorer": self._logic_explorer, ... }.

Ejecución: En cada tick, el motor busca la función correspondiente al agent.type y la ejecuta.

Input: Estado del mundo (snapshot de solo lectura para evitar modificaciones directas).

Output: Intención de movimiento (dx, dy).

Pathfinding: Los agentes "inteligentes" delegan el cálculo matemático de rutas al módulo estático Pathfinding.py.

4. Sistema de Binding Educativo (Frontend-Only)
Para cumplir el objetivo pedagógico sin exponer la complejidad real:

Realidad: Los agentes en el Backend ejecutan código Python complejo optimizado.

Espejo: El Frontend tiene una copia estática y simplificada de ese código en agentTemplates.js.

Vinculación: Cuando el usuario hace clic en un agente (en el Canvas o Sidebar), el Frontend busca el type del agente y carga el string de texto correspondiente en el RightPanel.

Ilusión: El usuario cree que está viendo el código "vivo" del agente, aunque en realidad ve una plantilla educativa que explica el comportamiento que el Backend está ejecutando.

5. Separación Fase 1 (Decisión) vs Fase 2 (Física)
El motor (step) sigue un orden estricto para evitar bugs de concurrencia y condiciones de carrera:

Snapshot: Crea una copia de los datos actuales del mundo.

Decisión: Todos los agentes "piensan" (_get_agent_decision) basándose en ese snapshot. Nadie se mueve aún.

Física: El motor aplica los movimientos secuencialmente, resolviendo colisiones (si A va a X y X está ocupado -> A se queda quieto o choca).

Interacción: Finalmente, se procesa la recolección de comida y la mensajería.

6. Comunicación en Tiempo Real (WebSocket Blindado)
La conexión WebSocket se diseñó para ser resiliente a desconexiones y reinicios rápidos (Hot Reload):

Frontend (Singleton Ref): Usamos useRef en el SimulationContext para garantizar que solo exista una única conexión activa incluso si React remonta componentes. Esto evita duplicidad de eventos.

Backend (Safe Broadcast): El ConnectionManager implementa un mecanismo de "iteración sobre copia" (active_connections[:]) con manejo de errores try/except.

Antes: Si un cliente cerraba el navegador mientras el servidor enviaba datos, el servidor colapsaba.

Ahora: Si el envío falla, el servidor captura la excepción, elimina silenciosamente la conexión muerta de la lista y el bucle de simulación continúa sin interrupciones.

Sincronización de Estado: El servidor envía un evento WORLD_UPDATE con el estado completo. El Reducer de React (UPDATE_WORLD) reemplaza el estado local con el del servidor, asegurando que el Frontend siempre sea un reflejo exacto del Backend (Single Source of Truth).