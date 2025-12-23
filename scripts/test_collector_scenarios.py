import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.simulation import SimulationEngine

MAX_STEPS = 30


def run_engine(engine, name):
    print(f"\n--- Escenario: {name} ---")
    print("Inicial:", [(a.id, a.x, a.y, getattr(a,'type',None)) for a in engine.agents], engine.food, engine.obstacles)
    for i in range(MAX_STEPS):
        engine.step()
        print(f"Paso {i+1}: ", [(a.id, a.x, a.y) for a in engine.agents], engine.food, engine.obstacles)
        if len(engine.food) == 0:
            print(f"✅ Comida recogida en paso {i+1}")
            return True
    print("⚠️ No se recogió la comida en el límite de pasos")
    return False


# 1) Obstacle with path around (indestructible wall with a gap)
def scenario_A():
    e = SimulationEngine()
    e.update_dimensions(7, 3)
    e.add_agent(0,1, agent_type='collector')
    e.add_food(6,1)
    # wall from x=1..5 at y=1 but gap at x=3 y=0 (we'll create gap above)
    for x in range(1,6):
        if x == 3:
            continue
        e.add_obstacle(x,1, obs_type='static', config={'destructible': False})
    return e

# 2) Destructible obstacle directly in the path (low cost), agent should break it
def scenario_B():
    e = SimulationEngine()
    e.update_dimensions(6,3)
    e.add_agent(0,1, agent_type='collector')
    e.add_food(3,1)
    # destructible obstacle at (1,1) cost 10
    e.add_obstacle(1,1, obs_type='static', config={'destructible': True, 'destructionCost': 10})
    return e

# 3) Dynamic obstacle that may block/unblock path
def scenario_C():
    e = SimulationEngine()
    e.update_dimensions(6,3)
    e.add_agent(0,1, agent_type='collector')
    e.add_food(5,1)
    # dynamic obstacles that can move and potentially block path
    e.add_obstacle(2,1, obs_type='dynamic')
    e.add_obstacle(3,1, obs_type='dynamic')
    return e

# 4) Two collectors racing for same food
def scenario_D():
    e = SimulationEngine()
    e.update_dimensions(6,3)
    e.add_agent(0,1, agent_type='collector')
    e.add_agent(1,2, agent_type='collector')
    e.add_food(4,1)
    return e


if __name__ == '__main__':
    scenarios = [
        ("A - Wall with gap (path around)", scenario_A),
        ("B - Destructible obstacle in path", scenario_B),
        ("C - Dynamic obstacles", scenario_C),
        ("D - Two collectors race", scenario_D),
    ]

    results = {}
    for name, fn in scenarios:
        eng = fn()
        ok = run_engine(eng, name)
        results[name] = ok

    print('\nResumen:')
    for k,v in results.items():
        print(f"{k}: {'OK' if v else 'FAILED'}")
