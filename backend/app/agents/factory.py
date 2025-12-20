from .models import Agent

class AgentFactory:
    @staticmethod
    def create_agent(agent_type: str, agent_id: str, x: int, y: int, **kwargs) -> Agent:
        """
        Crea una instancia de agente basada en el tipo solicitado.
        """
        # Normalizamos el tipo a minúsculas
        type_key = agent_type.lower()
        
        # Creamos el agente base
        new_agent = Agent(agent_id, x, y)
        
        # Asignamos el tipo explícitamente para que el SimulationEngine sepa qué lógica usar
        new_agent.type = type_key
        
        # Asignamos la estrategia si viene en los argumentos (para Planificadores)
        if "strategy" in kwargs:
            new_agent.strategy = kwargs["strategy"]

        # Configuración específica por tipo (Valores por defecto del Backend)
        # Nota: Estos pueden ser sobrescritos por la configuración que manda el Frontend
        
        if type_key == "reactive":
            new_agent.vision_radius = 1
            
        elif type_key == "explorer":
            new_agent.vision_radius = 5
            new_agent.visited = set() # Memoria
            
        elif type_key == "collector":
            new_agent.vision_radius = 10
            # Strategy ya se asignó arriba si venía en kwargs
            
        elif type_key == "cooperative":
            new_agent.vision_radius = 5
            new_agent.inbox = [] # Buzón de mensajes
            
        elif type_key == "competitive":
            new_agent.vision_radius = 8
            
        elif type_key == "q_learning":
            new_agent.vision_radius = 3
            # Inicializamos tabla Q vacía o parámetros de RL
            new_agent.epsilon = 0.1
            new_agent.alpha = 0.5
            new_agent.gamma = 0.9

        elif type_key == "custom":
            new_agent.vision_radius = 10 # Le damos buena visión por defecto
            # El código se asignará después mediante un evento específico,
            # o podemos cargar un default aquí si lo tenemos.
            new_agent.custom_code = None 

        # Si no reconocemos el tipo, lo dejamos como genérico (reactive)
        else:
            new_agent.type = "reactive"

        return new_agent