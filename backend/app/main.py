from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importamos el router modular
from app.api.v1.endpoints import simulation_ws
from app.api.v1.api import api_router

app = FastAPI(title="Plataforma Educativa Multi-Agente")

# --- CONFIGURACIÓN DE CORS (OBLIGATORIO) ---
# Esto permite que el puerto 5173 (React) hable con el 8000 (FastAPI)
app.add_middleware(
    CORSMiddleware,
    # "*" Permite todas las conexiones. En producción se cambia.
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluimos el router de API v1 (auth, projects, tutorials)
app.include_router(api_router, prefix="/api/v1")

# Incluimos el router del WebSocket
app.include_router(simulation_ws.router)


@app.get("/")
def read_root():
    return {"status": "online", "mode": "modular_architecture_v2"}
