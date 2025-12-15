from .base import Agent
from .reactive import ReactiveAgent
# Asegúrate de importar tus otras clases si existen (GoalBased, etc)
# from .goal_based import GoalBasedAgent 

class AgentFactory:
    @staticmethod
    def create_agent(agent_type: str, agent_id: str, x: int, y: int, **kwargs) -> Agent:
        print(f"🏭 Factory: Creando agente tipo '{agent_type}' en ({x}, {y})") # DEBUG LOG

        # Normalizamos a minúsculas para evitar errores de tipeo
        atype = agent_type.lower()

        try:
            # Mapeo de tipos del frontend a clases de Python
            if atype in ["reactive", "explorer", "collector"]:
                # Por ahora usamos ReactiveAgent para todos si no tienes las clases específicas creadas
                # Si tienes clase ExplorerAgent, úsala aquí: return ExplorerAgent(agent_id, x, y, **kwargs)
                return ReactiveAgent(agent_id, x, y, **kwargs)
            
            elif atype == "pro":
                # return GoalBasedAgent(agent_id, x, y, **kwargs)
                pass
            
            # DEFAULT: Si no reconoce el tipo, crea uno Reactivo básico
            print(f"⚠️ Tipo '{agent_type}' no reconocido, usando ReactiveAgent por defecto.")
            return ReactiveAgent(agent_id, x, y, **kwargs)

        except Exception as e:
            print(f"❌ Error fatal en Factory creando agente: {e}")
            raise e