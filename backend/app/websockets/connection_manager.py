from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # workspace_id -> {session_id: websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, workspace_id: str, session_id: str):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = {}
        self.active_connections[workspace_id][session_id] = websocket
        print(f"[Manager] Conexion registrada (workspace={workspace_id}, session={session_id})")

    def disconnect(self, websocket: WebSocket, workspace_id: str, session_id: str | None = None):
        rooms = [workspace_id] if workspace_id else list(self.active_connections.keys())
        for room in rooms:
            sessions = self.active_connections.get(room, {})
            if session_id and session_id in sessions:
                sessions.pop(session_id, None)
            else:
                for sid, ws in list(sessions.items()):
                    if ws == websocket:
                        sessions.pop(sid, None)
            if not sessions:
                self.active_connections.pop(room, None)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"[Manager] Error enviando mensaje personal: {e}")

    async def broadcast(self, workspace_id: str, message: dict):
        """Envía el mensaje a todas las conexiones de un workspace."""
        sessions = self.active_connections.get(workspace_id, {})
        for connection in list(sessions.values()):
            try:
                await connection.send_json(message)
            except Exception:
                # Si falla una conexión (ej: usuario cerró pestaña), seguimos
                pass


manager = ConnectionManager()
