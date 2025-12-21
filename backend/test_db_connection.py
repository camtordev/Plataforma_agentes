"""
Script para probar la conexión a PostgreSQL y verificar datos.
"""
from app.db.session import engine
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as conn:
            # Probar roles
            result = conn.execute(text('SELECT COUNT(*) FROM roles'))
            count_roles = result.scalar()
            print(f"✅ Conexión exitosa!")
            print(f"📊 Roles en DB: {count_roles}")
            
            # Probar achievements
            result = conn.execute(text('SELECT COUNT(*) FROM achievements'))
            count_achievements = result.scalar()
            print(f"🏆 Achievements en DB: {count_achievements}")
            
            # Probar users
            result = conn.execute(text('SELECT COUNT(*) FROM users'))
            count_users = result.scalar()
            print(f"👤 Usuarios en DB: {count_users}")
            
            # Probar tablas
            result = conn.execute(text("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public' 
                ORDER BY tablename
            """))
            tables = [row[0] for row in result]
            print(f"\n📋 Tablas disponibles ({len(tables)}):")
            for table in tables:
                print(f"   - {table}")
                
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_connection()
