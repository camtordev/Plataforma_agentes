from fastapi import WebSocket
from typing import Dict, List, Optional


class ConnectionManager:
    def __init__(self):
        # Conexiones agrupadas por session/workspace id
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.connections.setdefault(session_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket):
        for sid, conns in list(self.connections.items()):
            if websocket in conns:
                conns.remove(websocket)
                if not conns:
                    self.connections.pop(sid, None)
                break

    def is_active(self, websocket: WebSocket, session_id: str) -> bool:
        return websocket in self.connections.get(session_id, [])

    def has_connections(self, session_id: str) -> bool:
        return len(self.connections.get(session_id, [])) > 0

    async def broadcast(self, message: dict, session_id: Optional[str] = None):
        targets = (
            self.connections.get(session_id, [])[:] if session_id else []
        )
        for connection in targets:
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)


manager = ConnectionManager()
