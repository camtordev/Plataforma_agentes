from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.websockets.connection_manager import manager
from app.websockets.events import process_command
from app.services.game_instance import get_engine
from app.db.session import SessionLocal
from app.db.models.project import Project

router = APIRouter()

@router.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    project_id = websocket.query_params.get("project")
    engine = get_engine(project_id)

    # Si hay project_id y el motor está vacío, hidratar con world_state guardado
    if project_id and not (engine.agents or engine.food or engine.obstacles):
        session = SessionLocal()
        try:
            project = session.query(Project).filter(Project.id == project_id).first()
            if project and project.world_state:
                engine.load_state(project.world_state)
        finally:
            session.close()

    await manager.connect(websocket)
    print("✅ Cliente conectado (Modular)")
    
    try:
        # Enviar estado inicial
        await manager.send_personal_message(engine.get_state(), websocket)

        while True:
            # Si el socket ya no está en la lista (fue expulsado por error), rompemos el ciclo
            if websocket not in manager.active_connections:
                break

            timeout = engine.speed if engine.is_running else None
            
            try:
                # 1. Esperar mensaje
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})
                
                # 2. Procesar
                new_state = await process_command(engine, cmd_type, data)
                
                # 3. Responder
                await manager.send_personal_message(new_state, websocket)

            except asyncio.TimeoutError:
                # Timeout: Avanzamos la simulación
                if engine.is_running:
                    engine.step()
                    # Usamos broadcast porque el paso afecta a todos (si hubiera más clientes)
                    await manager.broadcast(engine.get_state())

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        engine.is_running = False
        print("❌ Cliente desconectado (Disconnect Event)")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"⚠️ Error crítico en WS loop: {e}")
