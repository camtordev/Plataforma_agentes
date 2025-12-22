from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import uuid
from app.websockets.connection_manager import manager
from app.websockets.events import process_command
from app.services.game_instance import get_engine, release_engine
from app.db.session import SessionLocal
from app.db.models.project import Project

router = APIRouter()


@router.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    project_id = websocket.query_params.get("project")
    workspace_id = websocket.query_params.get("workspace")
    session_id = (
        workspace_id
        or websocket.query_params.get("session")
        or websocket.query_params.get("instance")
        or str(uuid.uuid4())
    )
    is_readonly = websocket.query_params.get("readonly") == "1"
    engine = get_engine(project_id, workspace_id=workspace_id, session_id=session_id)

    # Si hay project_id y el motor está vacío, hidratar con world_state guardado
    if project_id and not (engine.agents or engine.food or engine.obstacles):
        session = SessionLocal()
        try:
            project = session.query(Project).filter(Project.id == project_id).first()
            if project and project.world_state:
                engine.load_state(project.world_state)
        finally:
            session.close()

    await manager.connect(websocket, session_id)
    print(f"WS Cliente conectado (session={session_id}, project={project_id})")
    
    try:
        # Enviar estado inicial solo a este websocket
        await manager.send_personal_message(engine.get_state(), websocket)

        while True:
            # Si el socket ya no está en la lista (fue expulsado por error), rompemos el ciclo
            if not manager.is_active(websocket, session_id):
                break

            timeout = engine.speed if engine.is_running else None
            
            try:
                # 1. Esperar mensaje
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})
                
                # 2. Procesar
                new_state = await process_command(engine, cmd_type, data)
                
                # 3. Responder a todos los clientes de este workspace
                await manager.broadcast(new_state, session_id=session_id)

            except asyncio.TimeoutError:
                # Timeout: Avanzamos la simulación
                if engine.is_running:
                    engine.step()
                    # Broadcast a todos en la misma sesión/workspace
                    await manager.broadcast(engine.get_state(), session_id=session_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        engine.is_running = False
        print("❌ Cliente desconectado (Disconnect Event)")
        # Persistir estado solo para sesiones no read-only
        if project_id and not is_readonly:
            session = SessionLocal()
            try:
                project = session.query(Project).filter(Project.id == project_id).first()
                if project:
                    state = engine.get_state().get("data", {})
                    project.world_state = state
                    project.grid_width = state.get("width", project.grid_width)
                    project.grid_height = state.get("height", project.grid_height)
                    if "config" in state:
                        existing_cfg = project.simulation_config or {}
                        incoming_cfg = state.get("config") or {}
                        # Merge para no perder metadatos como agentPlan
                        merged_cfg = {**existing_cfg, **incoming_cfg}
                        project.simulation_config = merged_cfg
                    session.commit()
            finally:
                session.close()
        # Liberar motor solo si no quedan conexiones en este workspace
        if not manager.has_connections(session_id):
            release_engine(project_id, workspace_id=workspace_id, session_id=session_id)
    except Exception as e:
        manager.disconnect(websocket)
        print(f"❌ Error crítico en WS loop: {e}")
        if not manager.has_connections(session_id):
            release_engine(project_id, workspace_id=workspace_id, session_id=session_id)
