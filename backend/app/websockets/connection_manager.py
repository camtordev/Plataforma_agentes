from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Iteramos sobre una COPIA de la lista ([:]) para poder borrar mientras iteramos
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                # Si falla el envío (cliente desconectado o error de socket), lo sacamos
                self.disconnect(connection)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            # Si falla el envío personal, asumimos desconexión
            self.disconnect(websocket)

manager = ConnectionManager()