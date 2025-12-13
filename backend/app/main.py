# backend/app/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from .simulation import SimulationEngine 

app = FastAPI(title="Plataforma Educativa Multi-Agente")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia global del motor
engine = SimulationEngine()

@app.get("/")
def read_root():
    return {"status": "online", "mode": "modular_architecture"}

@app.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Cliente conectado al WebSocket")
    
    try:
        # Enviar estado inicial al conectar
        await websocket.send_json(engine.get_state())

        while True:
            timeout = engine.speed if engine.is_running else None
            
            try:
                # Esperamos mensaje del frontend
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})

                # LOG DE DEPURACIÓN (Solo si no es STEP para no saturar)
                if cmd_type != "STEP":
                    print(f"📩 Recibido comando: {cmd_type} -> {data}")

                # --- COMANDOS DE CONTROL ---
                if cmd_type == "START": 
                    engine.is_running = True
                elif cmd_type == "STOP" or cmd_type == "PAUSE": 
                    engine.is_running = False
                elif cmd_type == "RESET": 
                    engine.reset()
                    await websocket.send_json(engine.get_state())
                elif cmd_type == "STEP":
                    engine.step()
                    await websocket.send_json(engine.get_state())
                elif cmd_type == "SET_SPEED":
                    spd = data.get("speed", 1)
                    if spd > 0: engine.speed = 0.5 / spd

                # --- CONFIGURACIÓN DEL GRID (Tamaño) ---
                elif cmd_type == "RESIZE_GRID": 
                    width = int(data.get("width", 25))
                    height = int(data.get("height", 25))
                    engine.update_dimensions(width, height)
                    await websocket.send_json(engine.get_state())

                # --- CONFIGURACIÓN DE SIMULACIÓN (Pasos, etc) ---
                # ESTE BLOQUE FALTABA EN TU CÓDIGO ANTERIOR
                elif cmd_type == "UPDATE_CONFIG":
                    engine.update_config(data)
                    await websocket.send_json(engine.get_state())

                # --- CREACIÓN DE ELEMENTOS ---
                elif cmd_type == "ADD_AGENT":
                    engine.add_agent(
                        data.get("x"), 
                        data.get("y"), 
                        agent_type=data.get("agent_type", "reactive"), 
                        strategy=data.get("strategy", "bfs")
                    )
                    await websocket.send_json(engine.get_state())

                elif cmd_type == "ADD_FOOD":
                    engine.add_food(data.get("x"), data.get("y"))
                    await websocket.send_json(engine.get_state())
                
                elif cmd_type == "ADD_OBSTACLE":
                    engine.add_obstacle(data.get("x"), data.get("y"))
                    await websocket.send_json(engine.get_state())

                elif cmd_type == "REMOVE_ELEMENT":
                    engine.remove_at(data.get("x"), data.get("y"))
                    await websocket.send_json(engine.get_state())

            except asyncio.TimeoutError:
                # Si se acaba el tiempo y la simulación corre, avanzamos un paso
                if engine.is_running:
                    engine.step()
                    await websocket.send_json(engine.get_state())

    except WebSocketDisconnect:
        engine.is_running = False
        print("❌ Cliente desconectado")
    except Exception as e:
        print(f"⚠️ Error en websocket: {e}")