import asyncio
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websockets.connection_manager import manager
from app.websockets.events import process_command
from app.services.game_instance import get_engine
from app.db.session import SessionLocal
from app.db.models.project import Project
from app.services.sandbox.code_parser import CodeParser

router = APIRouter()


@router.websocket("/ws/simulacion")
async def websocket_endpoint(websocket: WebSocket):
    # IDs que llegan en la URL
    project_id = websocket.query_params.get("project")
    workspace_id = websocket.query_params.get("workspace") or "default"
    session_id = websocket.query_params.get("instance") or "default_session"
    readonly_flag = websocket.query_params.get("readonly") == "1"

    # Motor aislado por workspace
    engine = get_engine(project_id=project_id, workspace_id=workspace_id, session_id=session_id)

    # Hidratamos desde DB solo si el motor no tiene estado
    if project_id and not (engine.agents or engine.food or engine.obstacles):
        session = SessionLocal()
        try:
            project = session.query(Project).filter(Project.id == project_id).first()
            if project and project.world_state:
                engine.load_state(project.world_state)
        finally:
            session.close()

    # Registrar conexión en su workspace
    await manager.connect(websocket, workspace_id, session_id)
    print(f"[WS] Cliente conectado (project={project_id}, workspace={workspace_id}, session={session_id})")

    try:
        # Enviar estado inicial
        await manager.send_personal_message(engine.get_state(), websocket)

        while True:
            timeout = engine.speed if engine.is_running else None

            try:
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=timeout)
                cmd_type = raw_data.get("type")
                data = raw_data.get("data", {})

                if readonly_flag:
                    await manager.send_personal_message({"type": "ERROR", "message": "Sesion en modo lectura"}, websocket)
                    continue

                # Actualizar código custom de agentes
                if cmd_type == "UPDATE_AGENT_CODE":
                    new_code = data.get("code")
                    try:
                        CodeParser.validate(new_code)
                        count = 0
                        for agent in engine.agents:
                            if getattr(agent, "type", "").lower() == "custom":
                                agent.custom_code = new_code
                                count += 1
                        await manager.send_personal_message(
                            {"type": "NOTIFICATION", "message": f"Codigo validado y aplicado a {count} agentes."},
                            websocket,
                        )
                    except Exception as e:
                        await manager.send_personal_message(
                            {"type": "ERROR", "message": f"Error de seguridad/sintaxis: {str(e)}"},
                            websocket,
                        )
                    continue

                # Procesamiento normal
                new_state = await process_command(engine, cmd_type, data)
                if new_state:
                    await manager.send_personal_message(new_state, websocket)

            except asyncio.TimeoutError:
                if engine.is_running:
                    engine.step()
                    await manager.broadcast(workspace_id, engine.get_state())

    except WebSocketDisconnect:
        manager.disconnect(websocket, workspace_id, session_id)
        print(f"[WS] Cliente desconectado (workspace={workspace_id}, session={session_id})")
    except Exception as e:
        manager.disconnect(websocket, workspace_id, session_id)
        print(f"[WS] Error critico en loop: {e}")
