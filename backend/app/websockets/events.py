from app.services.game_instance import get_engine

# Obtenemos la instancia del motor
engine = get_engine()

async def process_command(cmd_type: str, data: dict):
    """
    Recibe un comando y ejecuta la acción en el motor.
    Retorna el estado actualizado (dict) para notificar al cliente.
    """
    
    # LOG DE DEPURACIÓN (Muy útil para ver qué está pasando)
    if cmd_type != "STEP": # Omitimos STEP para no llenar la consola
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

    # --- NUEVO: ACTUALIZACIÓN DE CÓDIGO (Para Agente Personalizado) ---
    elif cmd_type == "UPDATE_AGENT_CODE":
        # Recibimos el tipo de agente (generalmente 'custom') y el código string
        target_type = data.get("agent_type")
        new_code = data.get("code")
        
        if target_type and new_code is not None:
            count = 0
            # Buscamos todos los agentes de ese tipo y les inyectamos el código
            for agent in engine.agents:
                if getattr(agent, "type", "") == target_type:
                    agent.custom_code = new_code
                    count += 1
            print(f"✅ Código actualizado para {count} agentes de tipo '{target_type}'")
        else:
             print("⚠️ Faltan datos para UPDATE_AGENT_CODE")

    # --- CREACIÓN DE ELEMENTOS ---
    elif cmd_type == "ADD_AGENT":
        print(f"   👾 Creando agente en ({data.get('x')}, {data.get('y')})") 
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
        # Pasamos el 'food_type' ("food" o "energy") al motor
        engine.add_food(
            data.get("x"), 
            data.get("y"), 
            food_type=data.get("food_type", "food"), 
            config=config
        )
    
    elif cmd_type == "ADD_OBSTACLE":
        config = data.get("config", {})
        engine.add_obstacle(data.get("x"), data.get("y"), config=config)

    elif cmd_type == "REMOVE_ELEMENT":
        engine.remove_at(data.get("x"), data.get("y"))

    # Retornamos el estado actual del motor para enviarlo de vuelta
    return engine.get_state()