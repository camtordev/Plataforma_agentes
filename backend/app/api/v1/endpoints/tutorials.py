from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict, Optional

router = APIRouter(prefix="/tutorials", tags=["tutorials"])


# -------------------------
# Schemas (Pydantic)
# -------------------------
class TutorialListItem(BaseModel):
    id: str
    level: int
    title: str
    description_markdown: Optional[str] = None


class TutorialDetail(TutorialListItem):
    theory_markdown: str
    objectives: List[str]
    starter_code: str
    world_preset: Dict[str, Any]
    success_criteria: Dict[str, Any]


# -------------------------
# "Seed" en memoria (MVP)
# Luego lo puedes mover a DB o JSON.
# -------------------------
TUTORIALS: List[Dict[str, Any]] = [
    {
        "id": "tut-1",
        "level": 1,
        "title": "Introducción a Agentes y Entornos",
        "description_markdown": "Qué es un agente, un entorno y cómo interactúan.",
        "theory_markdown": (
            "En este nivel aprenderás conceptos básicos:\n"
            "- Agente (percepción → decisión → acción)\n"
            "- Entorno (estado, recompensas)\n"
            "- Episodios\n"
        ),
        "objectives": [
            "Entender qué es un agente y un entorno",
            "Identificar estados y acciones",
        ],
        "starter_code": (
            "# Nivel 1 - Plantilla\n"
            "def act(observation):\n"
            "    # observation: dict con info del entorno\n"
            "    return 'STAY'\n"
        ),
        "world_preset": {"grid": {"rows": 10, "cols": 10}, "entities": []},
        "success_criteria": {"type": "manual", "note": "Solo lectura/introducción."},
    },
    {
        "id": "tut-2",
        "level": 2,
        "title": "Acciones básicas (moverse)",
        "description_markdown": "Controla el agente: arriba/abajo/izquierda/derecha.",
        "theory_markdown": "Mapear acciones a cambios de posición en una grilla.",
        "objectives": [
            "Implementar acciones de movimiento",
            "Evitar salir de los límites",
        ],
        "starter_code": (
            "ACTIONS = ['UP','DOWN','LEFT','RIGHT']\n\n"
            "def act(observation):\n"
            "    # Devuelve una acción válida\n"
            "    return 'UP'\n"
        ),
        "world_preset": {"grid": {"rows": 10, "cols": 10}, "entities": [{"type": "agent", "x": 0, "y": 0}]},
        "success_criteria": {"type": "reach", "target": {"x": 3, "y": 3}, "max_steps": 50},
    },
    {
        "id": "tut-3",
        "level": 3,
        "title": "Percepción: sensores y observaciones",
        "description_markdown": "Aprende a leer la observación para decidir mejor.",
        "theory_markdown": "Cómo interpretar la estructura de `observation`.",
        "objectives": ["Usar información del entorno", "Tomar decisiones condicionales"],
        "starter_code": (
            "def act(observation):\n"
            "    # ejemplo: observation.get('agent')\n"
            "    return 'RIGHT'\n"
        ),
        "world_preset": {"grid": {"rows": 10, "cols": 10}, "entities": [{"type": "agent", "x": 2, "y": 2}]},
        "success_criteria": {"type": "survive", "steps": 30},
    },
    {
        "id": "tut-4",
        "level": 4,
        "title": "Recompensas y objetivos",
        "description_markdown": "Define metas: recolectar comida y ganar recompensa.",
        "theory_markdown": "Reward shaping y señales de éxito/fracaso.",
        "objectives": ["Recolectar un recurso", "Entender recompensas positivas/negativas"],
        "starter_code": (
            "def act(observation):\n"
            "    # Busca comida en observation y muévete hacia ella\n"
            "    return 'UP'\n"
        ),
        "world_preset": {
            "grid": {"rows": 10, "cols": 10},
            "entities": [{"type": "agent", "x": 0, "y": 0}, {"type": "food", "x": 5, "y": 5}],
        },
        "success_criteria": {"type": "collect", "item": "food", "count": 1, "max_steps": 80},
    },
    {
        "id": "tut-5",
        "level": 5,
        "title": "Políticas simples (heurísticas)",
        "description_markdown": "Crea una política greedy hacia un objetivo.",
        "theory_markdown": "Política determinista vs aleatoria.",
        "objectives": ["Implementar una heurística", "Mejorar rendimiento en pasos"],
        "starter_code": (
            "def act(observation):\n"
            "    agent = observation.get('agent', {'x':0,'y':0})\n"
            "    target = observation.get('target', {'x':0,'y':0})\n"
            "    # TODO: mueve al agente hacia target\n"
            "    return 'RIGHT'\n"
        ),
        "world_preset": {"grid": {"rows": 12, "cols": 12}, "entities": [{"type": "agent", "x": 1, "y": 1}]},
        "success_criteria": {"type": "reach_any", "max_steps": 60},
    },
    {
        "id": "tut-6",
        "level": 6,
        "title": "Exploración vs explotación",
        "description_markdown": "Introduce aleatoriedad (ε-greedy).",
        "theory_markdown": "Balance entre explorar acciones y usar la mejor conocida.",
        "objectives": ["Implementar ε-greedy", "Comparar resultados"],
        "starter_code": (
            "import random\n"
            "EPS = 0.2\n"
            "ACTIONS = ['UP','DOWN','LEFT','RIGHT']\n\n"
            "def act(observation):\n"
            "    if random.random() < EPS:\n"
            "        return random.choice(ACTIONS)\n"
            "    # TODO: acción 'mejor' según heurística\n"
            "    return 'UP'\n"
        ),
        "world_preset": {"grid": {"rows": 12, "cols": 12}, "entities": [{"type": "agent", "x": 6, "y": 6}]},
        "success_criteria": {"type": "survive", "steps": 40},
    },
    {
        "id": "tut-7",
        "level": 7,
        "title": "Introducción a Q-Learning",
        "description_markdown": "Aprende el concepto de Q-Table y actualización.",
        "theory_markdown": "Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') − Q(s,a)]",
        "objectives": ["Comprender Q-Table", "Actualizar valores por experiencia"],
        "starter_code": (
            "import random\n\n"
            "Q = {}  # dict: (state, action) -> value\n"
            "ACTIONS = ['UP','DOWN','LEFT','RIGHT']\n"
            "ALPHA = 0.1\n"
            "GAMMA = 0.95\n"
            "EPS = 0.2\n\n"
            "def get_q(state, action):\n"
            "    return Q.get((state, action), 0.0)\n\n"
            "def choose_action(state):\n"
            "    if random.random() < EPS:\n"
            "        return random.choice(ACTIONS)\n"
            "    # greedy\n"
            "    qs = [(get_q(state,a), a) for a in ACTIONS]\n"
            "    return max(qs)[1]\n"
        ),
        "world_preset": {"grid": {"rows": 10, "cols": 10}, "entities": [{"type": "agent", "x": 0, "y": 0}]},
        "success_criteria": {"type": "learn", "episodes": 50},
    },
    {
        "id": "tut-8",
        "level": 8,
        "title": "Q-Learning aplicado (reto)",
        "description_markdown": "Completa un reto usando aprendizaje por refuerzo.",
        "theory_markdown": "Entrenar, evaluar y guardar resultados.",
        "objectives": ["Entrenar por episodios", "Mejorar score promedio"],
        "starter_code": (
            "# Nivel 8 - Reto\n"
            "# Implementa loop de entrenamiento y evaluación\n"
            "def train(env, episodes=200):\n"
            "    pass\n"
        ),
        "world_preset": {
            "grid": {"rows": 14, "cols": 14},
            "entities": [{"type": "agent", "x": 0, "y": 0}, {"type": "food", "x": 13, "y": 13}],
        },
        "success_criteria": {"type": "collect", "item": "food", "count": 1, "max_steps": 120},
    },
]


def _find_tutorial(tutorial_id: str) -> Optional[Dict[str, Any]]:
    return next((t for t in TUTORIALS if t["id"] == tutorial_id), None)


# -------------------------
# Endpoints
# -------------------------
@router.get("/", response_model=List[TutorialListItem])
def list_tutorials():
    # Devuelve solo lo necesario para tu grid (como tu frontend espera)
    return [
        {
            "id": t["id"],
            "level": t["level"],
            "title": t["title"],
            "description_markdown": t.get("description_markdown"),
        }
        for t in TUTORIALS
    ]


@router.get("/{tutorial_id}", response_model=TutorialDetail)
def get_tutorial(tutorial_id: str):
    t = _find_tutorial(tutorial_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tutorial no encontrado")
    return t
