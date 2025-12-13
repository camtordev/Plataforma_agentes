# backend/app/agents/factory.py
from .reactive import ReactiveAgent
# Aquí importarás tus futuros agentes (GoalBased, Utility, etc.)

class AgentFactory:
    @staticmethod
    def create_agent(agent_type, id, x, y, strategy="bfs"):
        if agent_type == "reactive":
            return ReactiveAgent(id, x, y)
        elif agent_type == "goal_based":
            # Asumiendo que tu GoalBasedAgent acepta 'strategy' en el constructor
            return GoalBasedAgent(id, x, y, strategy) 
        else:
            return ReactiveAgent(id, x, y)