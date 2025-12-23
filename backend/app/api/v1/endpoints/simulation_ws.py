from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.websockets.connection_manager import manager
from app.websockets.events import process_command
from app.services.game_instance import get_engine
from app.db.session import SessionLocal
from app.db.models.project import Project

# --- IMPORT NUEVO: SEGURIDAD ---
from app.services.sandbox.code_parser import CodeParser

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
    print(f"✅ Cliente conectado (Project: {project_id})")
    
    try:
        # Enviar estado inicial
        await manager.send_personal_message(engine.get_state(), websocket)

        while True:
            # 🚨 ELIMINAMOS EL IF QUE CAUSABA EL ERROR AQUÍ 🚨
            # (El control de desconexión lo hace el 'except' de abajo)

            timeout = engine.speed if engine.is_running else None
            
            try:
                # 1. Esperar mensaje
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})
                
                # ================================================================
                # 🛡️ INTERCEPCIÓN: Lógica de Código Personalizado (Botón Aplicar)
                # ================================================================
                if cmd_type == "UPDATE_AGENT_CODE":
                    new_code = data.get('code')
                    try:
                        # A. Validar Seguridad con CodeParser
                        CodeParser.validate(new_code)
                        
                        # B. Si es seguro, inyectar en los agentes
                        count = 0
                        for agent in engine.agents:
                            if getattr(agent, "type", "").lower() == "custom":
                                agent.custom_code = new_code
                                count += 1
                        
                        print(f" 📝 Código seguro actualizado en {count} agentes.")
                        
                        await manager.send_personal_message({
                            "type": "NOTIFICATION", 
                            "message": f"✅ Código validado y aplicado a {count} agentes."
                        }, websocket)

                    except Exception as e:
                        print(f" 🚫 Código inseguro bloqueado: {e}")
                        await manager.send_personal_message({
                            "type": "ERROR", 
                            "message": f"⛔ Error de seguridad/sintaxis: {str(e)}"
                        }, websocket)
                    
                    # Evitamos que pase al procesador de eventos estándar
                    continue 

                # ================================================================
                # 2. Procesar resto de comandos (START, STOP, ADD_AGENT...)
                # ================================================================
                new_state = await process_command(engine, cmd_type, data)
                
                # 3. Responder
                if new_state:
                    await manager.send_personal_message(new_state, websocket)

            except asyncio.TimeoutError:
                # Timeout: Avanzamos la simulación
                if engine.is_running:
                    engine.step()
                    await manager.broadcast(engine.get_state())

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Opcional: Pausar si se va el último cliente
        # if len(manager.active_connections) == 0: engine.is_running = False
        print("❌ Cliente desconectado (Disconnect Event)")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"⚠️ Error crítico en WS loop: {e}")