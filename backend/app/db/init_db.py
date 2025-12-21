# backend/app/db/init_db.py
"""
Script para inicializar la base de datos
Crea las tablas y datos iniciales (roles)
"""
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.db.models.user import Role
from app.db.models.tutorial import Tutorial


def init_db(db: Session) -> None:
    """
    Inicializa la base de datos con datos por defecto
    """
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    # Verificar si ya existen datos
    if db.query(Role).first():
        print("⚠️ La base de datos ya está inicializada")
        return

    print("🚀 Creando datos iniciales...")

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

    # Commit de todos los cambios
    db.commit()

    print("🎉 ¡Base de datos inicializada correctamente!")
    print("\n🔎 Resumen:")
    print(f"  - {len(roles)} roles creados")
    print("\nℹ️ Ahora puedes ejecutar las migraciones de Alembic")


if __name__ == "__main__":
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
