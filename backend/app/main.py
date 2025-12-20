from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importamos los routers
from app.api.v1.endpoints import simulation_ws
from app.api.v1 import api as api_v1

app = FastAPI(title="Plataforma Educativa Multi-Agente")

# --- CONFIGURACIÓN DE CORS (OBLIGATORIO) ---
# Esto permite que el puerto 5173 (React) hable con el 8000 (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # "*" Permite todas las conexiones. En producción se cambia.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluimos los routers
app.include_router(simulation_ws.router)
app.include_router(api_v1.api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "online", "mode": "modular_architecture_v2"}