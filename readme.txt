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
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Login y Registro
│   │   │   │   ├── projects.py      # Guardado/Carga de proyectos [cite: 96]
│   │   │   │   ├── tutorials.py     # Gestión de niveles pedagógicos [cite: 73]
│   │   │   │   └── analysis.py      # Endpoints para gráficas y stats [cite: 113]
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
│   │       ├── docker_client.py     # Conexión con contenedores
│   │       └── code_parser.py       # Validación estática antes de ejecutar
│   │
│   ├── websockets/                  # Comunicación Tiempo Real 
│   │   ├── connection_manager.py    # Maneja salas (rooms) para colaborativo
│   │   └── events.py                # Rutas del socket (connect, move, update)
│   │
│   └── main.py                      # Punto de entrada
├── alembic/                         # Migraciones de Base de Datos
├── tests/
├── requirements.txt
└── docker-compose.yml               # Orquestación (App, DB, Redis)


Puntos Clave del Backend:

    - services/engine/: Aquí reside la lógica que mueve a los 100 agentes. No está en la vista (API), sino en un servicio dedicado que corre en memoria.

    - sandbox/: Es el módulo encargado de tomar el string de código que viene del frontend y ejecutarlo aisladamente para cumplir con el RF3.2.

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
│   │   └── SimulationContext.jsx    # Guarda el estado actual del mundo (positions)
│   │
│   ├── hooks/                       # Lógica reutilizable
│   │   ├── useSocket.js             # Hook para conectar con FastAPI WebSockets
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



Flujo de Datos (Cómo se conectan)
Para cumplir el RF2 (Motor de Simulación):

Inicio: El usuario da click en "Play" en Toolbar.jsx.

Envío: CodeEditor.jsx envía el código Python actual a través de una petición POST a FastAPI.

Procesamiento: FastAPI valida el código en services/sandbox e inicia un "Game Loop" en services/engine.

Bucle (60 veces por segundo):

El Backend calcula las nuevas posiciones (x, y) y gasto de energía.

El Backend emite un evento WebSocket: { type: "WORLD_UPDATE", data: [ {id:1, x:10, y:5}, ... ] }.

Recepción: En el Frontend, useSocket.js recibe el JSON.


Renderizado: GridCanvas.jsx lee los nuevos datos y mueve los sprites de los agentes suavemente usando interpolación.