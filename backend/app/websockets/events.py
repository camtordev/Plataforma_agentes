# backend/app/websockets/events.py

# 1. IMPORTAMOS LA SEGURIDAD
from app.services.sandbox.code_parser import CodeParser

async def process_command(engine, cmd_type: str, data: dict):
    """
    Recibe un comando y ejecuta la acción en el motor.
    Retorna el estado actualizado (dict) para notificar al cliente.
    """
    
    if cmd_type != "STEP": 
        print(f"⚙️ Procesando evento: {cmd_type}")

    # --- COMANDOS DE CONTROL ---
    if cmd_type == "START":
        engine.is_running = True
    elif cmd_type == "STOP" or cmd_type == "PAUSE":
        engine.is_running = False
    elif cmd_type == "RESET":
        engine.reset()
    elif cmd_type == "STEP":
        engine.step()
    elif cmd_type == "SET_SPEED":
        spd = data.get("speed", 1)
        if spd > 0: engine.speed = 0.5 / spd

    # --- CONFIGURACIÓN ---
    elif cmd_type == "RESIZE_GRID":
        width = int(data.get("width", 25))
        height = int(data.get("height", 25))
        engine.update_dimensions(width, height)
    
    elif cmd_type == "UPDATE_CONFIG":
        engine.update_config(data)

    # --- ACTUALIZACIÓN DE CÓDIGO (CON SEGURIDAD) ---
    elif cmd_type == "UPDATE_AGENT_CODE":
        target_type = data.get("agent_type")
        new_code = data.get("code")
        
        if target_type and new_code is not None:
            # 🛡️ VALIDACIÓN DE SEGURIDAD
            try:
                CodeParser.validate(new_code)
                
                # Si pasa la validación, aplicamos los cambios
                count = 0
                for agent in engine.agents:
                    if getattr(agent, "type", "") == target_type:
                        agent.custom_code = new_code
                        count += 1
                print(f"✅ Código seguro actualizado para {count} agentes.")
            
            except Exception as e:
                # Si falla, imprimimos el error y NO guardamos nada
                print(f"⛔ ERROR DE SEGURIDAD: Código rechazado -> {e}")
                # Aquí podrías retornar un mensaje de error especial si tu frontend lo soporta
        else:
             print("⚠️ Faltan datos para UPDATE_AGENT_CODE")

    # --- CREACIÓN DE ELEMENTOS ---
    elif cmd_type == "ADD_AGENT":
        config = data.get("config", {})
        engine.add_agent(
            data.get("x"), 
            data.get("y"), 
            agent_type=data.get("agent_type", "reactive"), 
            strategy=data.get("strategy", "bfs"),
            config=config 
        )

    elif cmd_type == "ADD_FOOD":
        config = data.get("config", {})
        engine.add_food(
            data.get("x"), 
            data.get("y"), 
            food_type=data.get("food_type", "food"), 
            config=config
        )
    
    elif cmd_type == "ADD_OBSTACLE":
        config = data.get("config", {})
        subtype = data.get("subtype", "static") 
        engine.add_obstacle(
            data.get("x"), 
            data.get("y"), 
            obs_type=subtype,
            config=config
        )

    # MOVIMIENTO MASIVO
    elif cmd_type == "BATCH_MOVE":
        moves = data.get("moves", [])
        count = 0
        for move in moves:
            agent = next((a for a in engine.agents if a.id == move['id']), None)
            if agent:
                agent.x = max(0, min(engine.width - 1, move['x']))
                agent.y = max(0, min(engine.height - 1, move['y']))
                count += 1
        print(f"📦 Se movieron {count} agentes manualmente.")    

    elif cmd_type == "REMOVE_ELEMENT":
        engine.remove_at(data.get("x"), data.get("y"))

    # Retornamos el estado actual
    return engine.get_state()