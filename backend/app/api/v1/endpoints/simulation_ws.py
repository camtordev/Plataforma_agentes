from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.websockets.connection_manager import manager
from app.websockets.events import process_command
from app.services.game_instance import get_engine
from app.db.session import SessionLocal
from app.db.models.project import Project
from app.services.sandbox.code_parser import CodeParser

router = APIRouter()

@router.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    # 1. Recuperamos IDs de la URL
    project_id = websocket.query_params.get("project")
    # 'instance' es el ID de sesión único que usa tu frontend
    session_id = websocket.query_params.get("instance") or "default_session"

    engine = get_engine(project_id)

    # Hidratación del estado si es un proyecto guardado
    if project_id and not (engine.agents or engine.food or engine.obstacles):
        session = SessionLocal()
        try:
            project = session.query(Project).filter(Project.id == project_id).first()
            if project and project.world_state:
                engine.load_state(project.world_state)
        finally:
            session.close()

    # 🚨 AQUÍ ESTABA EL ERROR: Faltaba pasar session_id
    await manager.connect(websocket, session_id)
    
    print(f"✅ Cliente conectado (Project: {project_id}, Session: {session_id})")
    
    try:
        # Enviar estado inicial
        await manager.send_personal_message(engine.get_state(), websocket)

        while True:
            timeout = engine.speed if engine.is_running else None
            
            try:
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})
                
                # --- INTERCEPCIÓN CÓDIGO ---
                if cmd_type == "UPDATE_AGENT_CODE":
                    new_code = data.get('code')
                    try:
                        CodeParser.validate(new_code)
                        count = 0
                        for agent in engine.agents:
                            if getattr(agent, "type", "").lower() == "custom":
                                agent.custom_code = new_code
                                count += 1
                        
                        await manager.send_personal_message({
                            "type": "NOTIFICATION", 
                            "message": f"✅ Código validado y aplicado a {count} agentes."
                        }, websocket)

                    except Exception as e:
                        await manager.send_personal_message({
                            "type": "ERROR", 
                            "message": f"⛔ Error de seguridad/sintaxis: {str(e)}"
                        }, websocket)
                    continue 

                # --- PROCESAMIENTO NORMAL ---
                new_state = await process_command(engine, cmd_type, data)
                if new_state:
                    await manager.send_personal_message(new_state, websocket)

            except asyncio.TimeoutError:
                if engine.is_running:
                    engine.step()
                    await manager.broadcast(engine.get_state())

    except WebSocketDisconnect:
        # Al desconectar también hay que pasar el session_id si tu manager lo pide
        # Revisa tu connection_manager.py, normalmente disconnect(websocket, session_id)
        # Si da error aquí, prueba solo con websocket.
        try:
            manager.disconnect(websocket, session_id) 
        except TypeError:
            manager.disconnect(websocket) # Fallback por si acaso
            
        print("❌ Cliente desconectado")
    except Exception as e:
        try:
            manager.disconnect(websocket)
        except: pass
        print(f"⚠️ Error crítico en WS loop: {e}")