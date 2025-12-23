from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Guardamos: session_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        print(f"🔌 Manager: Conexión registrada ({session_id})")

    def disconnect(self, websocket: WebSocket, session_id: str = None):
        # Si nos dan el ID, borramos directo
        if session_id and session_id in self.active_connections:
            del self.active_connections[session_id]
        else:
            # Si no, buscamos qué ID tiene ese socket (más lento pero seguro)
            keys_to_remove = [k for k, v in self.active_connections.items() if v == websocket]
            for k in keys_to_remove:
                del self.active_connections[k]
        
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"⚠️ Error enviando mensaje personal: {e}")

    async def broadcast(self, message: dict):
        """Envía el mensaje a TODAS las conexiones activas."""
        # Iteramos sobre una copia de los valores para evitar errores si alguien se desconecta en medio
        for connection in list(self.active_connections.values()):
            try:
                await connection.send_json(message)
            except Exception:
                # Si falla una conexión (ej: usuario cerró pestaña), no rompemos el bucle
                pass

manager = ConnectionManager()