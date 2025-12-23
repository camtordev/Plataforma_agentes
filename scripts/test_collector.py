import sys, os
# Aseguramos que 'backend' esté en sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.simulation import SimulationEngine

# Escenario pequeño para reproducir bug: Collector ve comida pero se queda quieto
engine = SimulationEngine()
engine.update_dimensions(6, 3)
engine.add_agent(0, 0, agent_type='collector')
# Ponemos comida a distancia 2 para forzar movimiento
engine.add_food(2, 0)

print("Estado inicial:")
print([(a.id, a.x, a.y, getattr(a,'type',None)) for a in engine.agents], engine.food)

for i in range(10):
    engine.step()
    print(f"Paso {i+1}: ", [(a.id, a.x, a.y) for a in engine.agents], engine.food)
    if len(engine.food) == 0:
        print(f"✅ Comida recogida en paso {i+1}")
        break
else:
    print("⚠️ No se recogió la comida en 10 pasos")
