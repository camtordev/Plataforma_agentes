# backend/app/db/init_db.py
"""
Script para inicializar la base de datos
Crea las tablas y datos iniciales (roles, tutoriales, achievements)
"""
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.db.models.user import Role
from app.db.models.tutorial import Tutorial, Achievement


def init_db(db: Session) -> None:
    """
    Inicializa la base de datos con datos por defecto
    """
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    # Verificar si ya existen datos
    if db.query(Role).first():
        print("✅ La base de datos ya está inicializada")
        return

    print("🔨 Creando datos iniciales...")

    # ========================================
    # ROLES
    # ========================================
    roles = [
        Role(
            id=1,
            name="student",
            description="Estudiante con acceso básico",
            permissions={
                "can_create_projects": True,
                "can_delete_own_projects": True,
                "max_projects": 100,
                "can_view_public_projects": True
            }
        ),
        Role(
            id=2,
            name="teacher",
            description="Profesor con permisos para crear tutoriales",
            permissions={
                "can_create_projects": True,
                "can_create_tutorials": True,
                "can_view_student_stats": True,
                "can_moderate_comments": True,
                "max_projects": 500
            }
        ),
        Role(
            id=3,
            name="admin",
            description="Administrador con control total",
            permissions={
                "can_do_everything": True
            }
        )
    ]

    for role in roles:
        db.add(role)

    print("✅ Roles creados: student, teacher, admin")

    # ========================================
    # ACHIEVEMENTS (Ejemplos)
    # ========================================
    achievements = [
        Achievement(
            name="Primer Paso",
            slug="primer-paso",
            description="Completa tu primer tutorial",
            icon_url="/assets/achievements/first-step.png",
            unlock_criteria={"type": "tutorial_completed", "tutorial_id": 1},
            rarity="common",
            points=10
        ),
        Achievement(
            name="Explorador",
            slug="explorador",
            description="Completa todos los tutoriales de nivel básico",
            icon_url="/assets/achievements/explorer.png",
            unlock_criteria={"type": "tutorials_completed",
                             "min_count": 3, "max_level": 3},
            rarity="rare",
            points=50
        ),
        Achievement(
            name="Perfeccionista",
            slug="perfeccionista",
            description="Logra 95% de eficiencia en 5 tutoriales",
            icon_url="/assets/achievements/perfectionist.png",
            unlock_criteria={"type": "efficiency_master",
                             "min_efficiency": 95, "count": 5},
            rarity="epic",
            points=100
        ),
        Achievement(
            name="Velocista",
            slug="velocista",
            description="Completa un tutorial en tiempo récord",
            icon_url="/assets/achievements/speedrunner.png",
            unlock_criteria={"type": "speed_runner", "max_time_seconds": 300},
            rarity="rare",
            points=75
        ),
        Achievement(
            name="Maestro IA",
            slug="maestro-ia",
            description="Completa todos los 8 tutoriales con éxito",
            icon_url="/assets/achievements/master.png",
            unlock_criteria={"type": "all_tutorials_completed"},
            rarity="legendary",
            points=500
        )
    ]

    for achievement in achievements:
        db.add(achievement)

    print("✅ Logros creados: 5 achievements de ejemplo")

    # Commit de todos los cambios
    db.commit()

    print("✨ ¡Base de datos inicializada correctamente!")
    print("\n📊 Resumen:")
    print(f"  - {len(roles)} roles creados")
    print(f"  - {len(achievements)} logros creados")
    print("\n🚀 Ahora puedes ejecutar las migraciones de Alembic")


if __name__ == "__main__":
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
