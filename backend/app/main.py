from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random

# Inicializamos la aplicación
app = FastAPI(title="Plataforma Educativa Multi-Agente")

# --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
# Esto es vital. Permite que tu Frontend (React) se conecte a este Backend.
app.add_middleware(
    CORSMiddleware,
    # Si tu frontend corre en otro puerto, cámbialo aquí.
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RUTAS BÁSICAS ---
@app.get("/")
def read_root():
    """Ruta de prueba para ver si el servidor responde"""
    return {"status": "online", "version": "1.0.0"}

# --- MOTOR DE SIMULACIÓN (WebSockets) ---
# Este endpoint cumple con el RF2 del documento: Ejecución en tiempo real
@app.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Cliente (Frontend) conectado al WebSocket")
    
    # ESTADO INICIAL DEL MUNDO
    # Creamos un agente en la celda (12, 12) del Grid
    # El Grid es de 25x25, así que las coordenadas van de 0 a 24.
    agents = [
        {"id": 1, "x": 12, "y": 12, "color": "#ef4444"}, # Rojo
        {"id": 2, "x": 5, "y": 5, "color": "#3b82f6"}    # Azul (Segundo agente de prueba)
    ]
    
    try:
        while True:
            # 1. ACTUALIZAR ESTADO (RF2.1 Ejecución de Agentes)
            # Aquí iría la lógica compleja del "Engine". Por ahora, movimiento aleatorio.
            for agent in agents:
                dx = random.choice([-1, 0, 1]) # Moverse -1, 0 o +1 en X
                dy = random.choice([-1, 0, 1]) # Moverse -1, 0 o +1 en Y
                
                # Actualizar posición asegurando que no se salga del grid (0-24)
                agent["x"] = max(0, min(24, agent["x"] + dx))
                agent["y"] = max(0, min(24, agent["y"] + dy))
            
            # 2. ENVIAR DATOS (RF2.2 Visualización Animada)
            # Enviamos la lista de agentes como texto JSON
            await websocket.send_text(json.dumps(agents))
            
            # 3. CONTROL DE VELOCIDAD (Tick Rate)
            # Esperamos 0.2 segundos (5 FPS) para que se vea el salto entre celdas
            await asyncio.sleep(0.2)
            
    except WebSocketDisconnect:
        print("❌ Cliente desconectado")
    except Exception as e:
        print(f"⚠️ Error en la simulación: {e}")